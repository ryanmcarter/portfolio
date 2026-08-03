# Kraidle — A Connected, AI-Augmented Design System

Kraidle connects Figma, production code, and AI-assisted workflows through one
set of shared foundations and enforceable rules.

## The ask

Prior to kraidle, there was an existing design system called...kradle.  Kradle was mostly just a design system in name only, it was built by our marketing/graphic designer and never fully maintained.  This naturally led to component drift, numerous variants of common components such as cards, inconsistent color usage and so on (all the usual challenges of a non-regularly maintained design system). On the engineering side, complaints were starting to arise around maintaining these variants and the time/resources necessary to adapt new slight variants of existing components.  During all of these, the original creator of the design system left the company.

Fast forward to early-mid 2026 and Gradle (which briefly became Gradle Technologies) was embarking on a total rebrand to develocity.ai, which presented an opportunity for a new design system. One that was built with AI in mind, one that was token-based, and most important, one that could be built fast.  Thus, kr**AI**dle was born (a crafty way of keeping the existing kradle name, but reflecting the new age of AI).

Lastly, one major requirement was that any product page on the marketing site could be authored in markdown by non-technical coworkers, so I also created a markdown-to-NextJS converter to accomplish this.

> **The goal: ** Create a token-powered design system with Claude Code, complete with Code Connect linkages to Figma components, all powering web pages that could be written by anyone via markdown.

## 2. Goals & guiding principles

Seven principles, in priority order:

1. **Token-first.** No hardcoded values anywhere — color, spacing,
   radius, shadow, typography, motion. Every visual decision is a
   token.
2. **Single source of truth.** Tokens live in *one* file
   (`packages/tokens/tokens/tokens.json`). The Figma library and the
   codebase are both *derived*. There is no second place to look.
3. **AI-augmented, not AI-dependent.** Every layer (tokens, lint, CI,
   Storybook) works without Claude Code. AI just compresses the loop.
4. **Enforcement by default.** The lint layer makes the right path the
   easy path. Wrong paths fail before review.
5. **Bidirectional sync.** Tokens flow from Figma to code via Tokens
   Studio (two-way git sync). Components flow back to Figma via Code
   Connect. Generated pages can be serialized into the Figma file as
   library-bound frames.
6. **Quality shifts left.** A passive linter runs in the Figma canvas;
   ESLint runs at author time; axe runs in CI; token impact previews
   land on the PR before merge. Issues surface where they're cheapest.
7. **The system grows itself.** Unmapped Figma elements automatically
   become labelled GitHub issues — every gap becomes a tracked
   component request rather than a silently improvised stub.

---

## 3. The system at a glance

```
                          ┌──────────────────────┐
                          │  Designer in Figma   │
                          │  Variables · Library │
                          │  Passive linter      │
                          │  widget on canvas    │
                          └──────────┬───────────┘
                                     │  Tokens Studio
                                     │  (DTCG JSON, 2-way git sync)
                                     ▼
        ┌───────────────────────────────────────────────────────────┐
        │  packages/tokens/tokens/tokens.json   ← 235 lines, single │
        │                                         source of truth   │
        │  build.js (Style Dictionary)                              │
        │  → dist/tokens.css        313 lines, --kr-* CSS vars      │
        │  → dist/tokens.js / .d.ts typed JS constants              │
        └───────────────┬───────────────────────────────────────────┘
                        │  consumed via @kraidle/tokens
                        ▼
       ┌───────────────────────────────────────────────────────────┐
       │  packages/ui  (@kraidle/ui)                               │
       │   27 components × { *.tsx, *.stories.tsx, *.figma.tsx }  │
       │   Built on Base UI primitives + class-variance-authority  │
       │   globals.css 393 lines wires Tailwind ↔ --kr-* via       │
       │   `@theme inline { … }`                                   │
       └────────┬──────────────────────────────────────────────────┘
                │
   ┌────────────┼────────────────────────────────────────┐
   ▼            ▼                                        ▼
apps/web    component-inventory.json (1,043 lines,   Storybook
(Next.js)   27 components: name, import, figma id,    └── Chromatic (visual)
            variants, stories, tokens_used)           └── axe-playwright (a11y)
                │
                │       ┌────────────────────────────────────┐
                └──────▶│  AI surface area                   │
                        │  • Claude skills consume inventory │
                        │  • figma-to-code → React           │
                        │  • code-to-figma → Figma REST JSON │
                        │  • component-request blocks → CI   │
                        │    auto-files labelled issues      │
                        └────────────────────────────────────┘
```

### Three guarantees holding the system together

```
1. Tokens are the only source of visual truth.
   ↳ Components reference --kr-* vars or Tailwind classes that resolve
     through @theme inline. ESLint blocks any hex/rgb/hsl/oklch literal.

2. The component inventory is the only source of "what exists".
   ↳ component-inventory.json is generated from the codebase.
     AI consumers read it. Gaps emit component-request blocks.
     CI converts those blocks into labelled GitHub issues.

3. Enforcement lives at the lint layer, not the review layer.
   ↳ Five custom ESLint rules. Six CI workflows. One Figma widget.
     Reviewers focus on intent; the machine handles compliance.
```

---

## 4. Repository architecture

A single Turborepo monorepo, npm workspaces, Node ≥ 20, npm ≥ 11.3.0.
No global tools required.

```
kraidle/
├── apps/
│   └── web/                          Next.js 16 marketing site (Turbopack)
│       ├── app/                      App Router incl. dynamic [slug]
│       ├── content/pages/            Markdown content w/ typed frontmatter
│       ├── lib/pages/                Frontmatter schema + template dispatcher
│       └── mdx-components.tsx        MDX → @kraidle/ui mapping
│
├── packages/
│   ├── tokens/                       @kraidle/tokens
│   │   ├── tokens/tokens.json        ← 235 lines, single source of truth
│   │   ├── build.js                  Style Dictionary config
│   │   └── dist/                     ← generated; do not edit
│   │       ├── tokens.css            313 lines of --kr-* CSS vars
│   │       ├── tokens.js
│   │       └── tokens.d.ts
│   │
│   ├── ui/                           @kraidle/ui
│   │   ├── src/components/           27 components × { tsx, stories, figma }
│   │   ├── src/styles/globals.css    393 lines bridging Tailwind ↔ tokens
│   │   ├── .storybook/
│   │   │   ├── main.ts               5 addons: docs, chromatic, a11y,
│   │   │   │                         designs, pseudo-states
│   │   │   ├── preview.ts            dark-default backgrounds
│   │   │   └── test-runner.ts        axe-playwright config (WCAG 2.1 AA)
│   │   └── storybook-static/         build output → Chromatic input
│   │
│   ├── eslint-plugin/                @kraidle/eslint-plugin
│   │   └── src/rules/
│   │       ├── no-hardcoded-colors.js
│   │       ├── no-raw-spacing.js
│   │       ├── enforce-ds-imports.js
│   │       ├── require-ds-story.js
│   │       └── no-deprecated-tokens.js
│   │
│   ├── eslint-config/                Shared flat-config presets
│   ├── typescript-config/            Shared tsconfig bases
│   │
│   └── figma-plugin/                 994 lines TS — plugin + widget
│       ├── manifest.json             menu commands + relaunch buttons
│       ├── src/
│       │   ├── plugin/main.ts        plugin sandbox; audit + auto-fix
│       │   ├── widget/widget.tsx     passive live-counter widget
│       │   ├── ui/index.{html,ts}    plugin panel
│       │   ├── audit/                pure audit logic (shared)
│       │   │   ├── fills.ts          unbound fills + strokes
│       │   │   ├── spacing.ts        raw spacing
│       │   │   ├── typography.ts     unlinked text styles
│       │   │   ├── components.ts     detached / non-library
│       │   │   ├── types.ts          Violation discriminated union
│       │   │   └── index.ts          auditNodes() + summarize()
│       │   └── shared/messages.ts    UiToPlugin / PluginToUi types
│       └── widget/                   built widget bundle
│
├── scripts/
│   ├── generate-inventory.mjs        Storybook → component-inventory.json
│   ├── token-diff.mjs                git-aware DTCG diff
│   ├── impact-map.mjs                token-diff + inventory → markdown
│   ├── extract-requests.mjs          PR body/diff → request JSON
│   └── create-issues.mjs             requests → labelled GH issues
│
├── component-inventory.json          ← generated; 1,043 lines
├── docs/
│   ├── design-system-strategy.md     long-form rationale (13 sections)
│   ├── architecture-overview.md      one-page system map
│   └── case-study.md                 ← this document
├── CLAUDE.md                         AI authoring rules
├── README.md
└── turbo.json
```

### Why a monorepo?

- **One PR can change a token, regenerate `dist/`, update consuming
  components, and refresh the inventory.** No coordinated multi-repo
  release dance.
- **Turbo's task graph** lets `apps/web` build only after `@kraidle/ui`
  builds only after `@kraidle/tokens` builds — automatically derived
  from `package.json` `dependencies`, no manual ordering.
- **Shared TypeScript and ESLint configs** live in their own packages
  (`@kraidle/typescript-config`, `@kraidle/eslint-config`), so adding a
  new app inherits the same rules in two lines.

---

## A production component, live

This is a live port of Kraidle's tabbed navigation pattern—the same component
shown in the Develocity capability experience. Its selected state, hover motion,
and responsive overflow come from the production component. Choose any label to
preview the animated selected state; the controls are intentionally non-navigating,
and the design-system tokens are mapped locally so the example remains self-contained.

<KraidleTabsShowcase />

---

## My role and strategy

As Product Designer and Design Engineer, I designed Kraidle across the boundary
between Figma and code. That included the token architecture, component model,
Figma-to-code mappings, quality checks, and the context an AI agent needs to use
the system correctly.

I framed the work around three design constraints:

1. **One source for visual decisions.** Figma variables and code tokens should
   derive from the same data rather than being manually matched.
2. **One inventory of reusable parts.** People and AI agents should be able to
   discover the same components, variants, imports, stories, and token usage.
3. **Quality enforced where work happens.** Problems should surface on the
   Figma canvas, in the editor, and on the pull request—not during a final design
   review.

This shifted the design system from a library that teams reference into an
operating layer that actively guides how interfaces are created.

## One system, three connected layers

### 1. Shared foundations

Kraidle starts with a single token source covering color, spacing, typography,
radius, shadow, sizing, opacity, and motion. Tokens Studio keeps that source in
sync with Figma, while the code build turns it into typed values and CSS custom
properties.

The same foundations power a React component library built from accessible
primitives. Each component pairs implementation with a Storybook story and a
Code Connect mapping, so its design variants and production API can be reviewed
side by side.

The important decision was not the toolchain. It was removing the need to
re-create visual decisions at each stage. A token change begins in one place; a
component has one intended implementation; both design and code consume the
same contract.

### 2. Machine-readable context

AI tools need more than a screenshot. They need to know which component to use,
how its Figma properties map to React props, where it is imported from, which
variants exist, and what constraints the team expects it to follow.

Kraidle generates a component inventory from the codebase to make that context
explicit. The inventory describes every component's import, variants, stories,
Figma mapping, and token dependencies. AI workflows read it before generating
an interface.

If a design element has no match, the workflow does not quietly invent a local
component. It emits a component request that can become a tracked issue. A gap
in the system becomes visible backlog instead of hidden product debt.

### 3. Guardrails close to the work

The system uses several layers of feedback because no single check can protect
the entire design-to-code loop.

- A Figma widget and audit panel flag unbound values while a designer is still
  working on the canvas.
- Five custom ESLint rules check for hardcoded visual values, local substitutes
  for design-system components, missing stories, and deprecated tokens.
- Pull-request workflows rebuild tokens, preview affected components, run
  accessibility checks, and publish visual changes for review.

These checks were designed to catch drift early and consistently. They also
hold human-authored and AI-generated work to the same standard.

## How the loop works

One page moving from design to implementation follows a short, reviewable path:

1. A designer builds the Figma frame with library components and token-bound
   values. The canvas linter exposes gaps before handoff.
2. The AI workflow receives the Figma frame plus Kraidle's generated component
   inventory and token context.
3. The agent maps the frame to existing React components. Anything unmapped is
   returned as a component request rather than improvised code.
4. The resulting implementation enters the normal pull-request process, where
   lint, accessibility, token-impact, and visual checks run automatically.
5. Design and engineering review the exceptions and intent while automated
   checks handle repeatable compliance work.

The loop is bidirectional: production component mappings can inform Figma, and
responsive implementations can be brought back for design review. Figma, code,
and the AI agent remain different tools, but they operate from shared context
instead of separate interpretations.

## Results and lessons

At the time of this case study, the system included:

| System coverage | Implementation |
|---|---|
| Reusable UI | **27 React components**, each with a Storybook story and Code Connect file |
| Machine-readable context | A generated inventory covering all 27 components |
| Code enforcement | **5 custom ESLint rules** |
| Pull-request automation | **6 GitHub Actions workflows** spanning tokens, lint, accessibility, visual review, and component requests |
| Design feedback | A Figma plugin and passive canvas widget for token and component checks |

These numbers describe implementation coverage, not business impact. The more
meaningful outcome was a coherent workflow: design decisions could travel from
tokens to components to generated interfaces without relying on memory or
manual translation at every step.

Three lessons shaped the final system:

- **Context matters more than clever prompting.** AI became more useful when
  component APIs, usage rules, and design decisions were explicit.
- **Governance should be deterministic.** Lint, accessibility tests, and visual
  checks make quality repeatable whether the author is a person or an agent.
- **Exceptions should improve the system.** Turning unmapped elements into
  component requests makes new product work a source of design-system insight.

Kraidle is AI-augmented, not AI-dependent. Its strongest contribution is not
automatic interface generation; it is the connected foundation that makes
generated work understandable, reviewable, and reusable.
