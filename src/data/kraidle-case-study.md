# Kraidle — A Connected, AI-Augmented Design System

Kraidle connects Figma, production code, and AI-assisted workflows through one
set of shared foundations and enforceable rules.

## The ask

Prior to kraidle, there was an existing design system called...kradle.  Kradle was mostly just a design system in name only, it was built by our marketing/graphic designer and never fully maintained.  This naturally led to component drift, numerous variants of common components such as cards, inconsistent color usage and so on (all the usual challenges of a non-regularly maintained design system). On the engineering side, complaints were starting to arise around maintaining these variants and the time/resources necessary to adapt new slight variants of existing components.  During all of these, the original creator of the design system left the company.

Fast forward to early-mid 2026 and Gradle (which briefly became Gradle Technologies) was embarking on a total rebrand to develocity.ai, which presented an opportunity for a new design system. One that was built with AI in mind, one that was token-based, and most important, one that could be built fast.  Thus, kr**AI**dle was born (a crafty way of keeping the existing kradle name, but reflecting the new age of AI).

Lastly, one major requirement was that any product page on the marketing site could be authored in markdown by non-technical coworkers, so I also created a markdown-to-NextJS converter to accomplish this.

> **The goal: ** Create a token-powered design system with Claude Code, complete with Code Connect linkages to Figma components, all powering web pages that could be written by anyone via markdown.

## My role and strategy

As one of only four members of the Gradle design team, and the one with the most experience in design systems & Claude, I volunteered to create the design system, mostly as a way to continue to learn how to use AI to ship code to production. 

Overall, I created about 95% of the design system (the remaining 5% were deeply technical/network/infrastructure tasks that a separate front-end engineer took on that were just a bit beyond my comfort zone.) 

This included the token architecture, coded components, Figma Code Connect mappings, automated testing, marketing page templates, and the markdown to NextJS converter.

## Goals & guiding principles

Seven principles, in priority order:

1. **Token-first. ** No hardcoded values anywhere — color, spacing,
   radius, shadow, typography, motion. Every visual decision is a
   token.
2. **AI-augmented, not AI-dependent. ** Every layer (tokens, lint, CI,
   Storybook) works without Claude Code. AI just compresses the loop.
3. **Enforcement by default. ** The lint layer makes the right path the
   easy path. Wrong paths fail before review.
4. **Bidirectional sync. ** Tokens flow from Figma to code via Tokens
   Studio (two-way git sync). Components flow back to Figma via Code
   Connect. Generated pages can be serialized into the Figma file as
   library-bound frames.
5. **Quality shifts left. ** A passive linter runs in the Figma canvas;
   ESLint runs at author time; axe runs in CI; token impact previews
   land on the PR before merge. Issues surface where they're cheapest.
6. **The system grows itself. ** Unmapped Figma elements automatically
   become labelled GitHub issues — every gap becomes a tracked
   component request rather than a silently improvised stub.
7. **Enforcement on the Figma canvas: ** To further ensure compliance, one Figma plugin allowed for a full page audit on system usage, and a live widget tracked design values not mapped to a token.

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

---

## Repository architecture

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
│   │   ├── tokens.json               ← 235 lines, single source of truth
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

---

## A production component, live

This is a live port of Kraidle's tabbed navigation pattern—the same component
shown in the Develocity capability experience. Its selected state, hover motion,
and responsive overflow come from the production component. Choose any label to
preview the animated selected state; the controls are intentionally non-navigating,
and the design-system tokens are mapped locally so the example remains self-contained.

<KraidleTabsShowcase />

---

## Authoring pages via a markdown to NextJS engine.

Kraidle turns structured page content into typed Next.js templates through a
small parsing and resolution layer. In development, a preview parser lets an
author begin with an empty file and see the page take shape as fields are added;
production keeps the full schema, slug, value, and reference-integrity checks so
incomplete content cannot silently ship.

<Video src="/assets/kraidle-markdown-c3.mp4" title="Screen recording of authoring a Kraidle page from an empty content file" />

---

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
| Pull-request automation | **6 GitHub Actions workflows ** spanning tokens, lint, accessibility, visual review, and component requests |
| Design feedback | A Figma plugin and passive canvas widget for token and component checks |

From start to the go-live rebranding date, kraidle took just over a month from the first Claude prompt for tokens through to the MVP of the landing pages and all necessary components being created.  Overall, kraidle drastically increased the speed at which the web team can create new pages.  It also let team leads, subject matter experts, and non-technical employees create pages to their liking via the markdown converter, without ever having to write a line of code.

For me personally, kraidle was an incredibly boost to my design engineering skills, and was the first large scale engineering project I undertook as a designer.  It was lots of fun to learn a new skill and be able to ship code to production and to bring my designs to life.
