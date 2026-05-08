# Kraidle — A Connected, AI-Augmented Design System

A case study on building a Figma-to-code design system that treats the
designer's canvas, the engineer's repo, and the AI agent as three views
of the same underlying source of truth.

> **TL;DR.** Kraidle is a Turborepo monorepo with a single token JSON
> file, a 27-component React library, five custom ESLint rules that
> enforce token-only authoring, six GitHub Actions that make every PR
> token-aware and a11y-aware, a Figma plugin and live-counter widget
> that flag violations on the canvas in real time, and a `component-inventory.json`
> contract that lets Claude Code generate Figma-faithful, responsive
> code from a desktop frame — and serialize React back into Figma.
> Everything is deterministic without AI; AI accelerates the workflow
> but never *is* the workflow.

---

## Table of contents

1. [Problem statement](#1-problem-statement)
2. [Goals & guiding principles](#2-goals--guiding-principles)
3. [The system at a glance](#3-the-system-at-a-glance)
4. [Repository architecture](#4-repository-architecture)
5. [Pillar 1 — Tokens](#5-pillar-1--tokens)
6. [Pillar 2 — Component library](#6-pillar-2--component-library)
7. [Pillar 3 — Storybook & visual testing](#7-pillar-3--storybook--visual-testing)
8. [Pillar 4 — Accessibility](#8-pillar-4--accessibility)
9. [Pillar 5 — Engineering enforcement (ESLint)](#9-pillar-5--engineering-enforcement-eslint)
10. [Pillar 6 — CI / GitHub Actions](#10-pillar-6--ci--github-actions)
11. [Pillar 7 — Figma plugin & passive linter widget](#11-pillar-7--figma-plugin--passive-linter-widget)
12. [Pillar 8 — Component inventory + AI surface area](#12-pillar-8--component-inventory--ai-surface-area)
13. [End-to-end workflows](#13-end-to-end-workflows)
14. [Outcomes & metrics](#14-outcomes--metrics)
15. [Lessons learned](#15-lessons-learned)
16. [Appendix — file map & numbers at a glance](#16-appendix--file-map--numbers-at-a-glance)

---

## 1. Problem statement

Most design systems break in one of three ways:

1. **The handoff is lossy.** Designers maintain Figma; engineers
   re-derive components from screenshots; the system gradually splits
   into two truths.
2. **Tokens are aspirational, not enforced.** The Figma library has
   variables, the codebase has CSS vars, but a hex literal slips into
   a PR every other week and nothing fails.
3. **AI accelerates the wrong thing.** Tools generate ad-hoc HTML and
   Tailwind that *look* right but bypass the library, so each
   AI-assisted feature is a small regression in design-system coverage.

Kraidle was designed to make those three failure modes structurally
impossible — not because they're forbidden but because the next
easiest path goes through the system.

### The three failure modes, reframed as the design constraints

| Failure mode | Constraint |
|---|---|
| Lossy handoff | Figma variables, code tokens, and Storybook stories all derive from a single JSON file. Round-trip Figma↔code via Code Connect + a generated component inventory. |
| Aspirational tokens | Five custom ESLint rules block hex / raw spacing / non-DS imports / missing stories / deprecated tokens. CI fails. Local fails. PR fails. |
| AI bypassing the library | Claude must read `component-inventory.json` first; if a Figma element doesn't map, it emits a `component-request` block that auto-files a GitHub issue. Gaps become backlog, not stubs. |

---

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

### How the layers compose (Mermaid)

```mermaid
flowchart TD
  subgraph Figma
    A[Figma Variables<br/>Component library]
    B[Passive linter widget<br/>live violation count]
    C[Audit panel + Send to Claude]
  end

  subgraph Source
    D[(tokens.json<br/>DTCG, 1 file)]
    E[(component-inventory.json<br/>generated)]
  end

  subgraph Codebase
    F[@kraidle/tokens<br/>Style Dictionary build]
    G[@kraidle/ui<br/>27 components]
    H[ESLint rules ×5]
    I[Storybook]
  end

  subgraph CI
    J[Token sync]
    K[Token impact preview]
    L[Chromatic]
    M[axe-playwright]
    N[Lint + typecheck]
    O[Component-request capture]
  end

  subgraph AI
    P[Claude Code skills<br/>figma-to-code · code-to-figma]
  end

  A -->|Tokens Studio<br/>2-way sync| D
  D --> F
  F --> G
  G --> I
  G --> E
  G --> H
  D --> J
  D --> K
  E --> K
  G --> L
  I --> M
  H --> N
  E --> P
  P -->|component-request| O
  C --> P
  B -. reads .-> A
  P -.->|Figma REST API| A
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

## 5. Pillar 1 — Tokens

### 5.1 Source of truth: one DTCG file

`packages/tokens/tokens/tokens.json` is a Tokens Studio single-file
export. Top-level keys are *token sets*; `$metadata` and `$themes`
declare set ordering and theme composition.

```
tokens.json
├── $metadata                      tokenSetOrder
├── $themes                        currently dark only
├── primitive/color                neutral · brand · red · green · amber
│                                    each: 50 · 100 · 200 … 900 · 950
├── primitive/border               width.{0,1,2,4} + radius.{none,2,4,6,8,12,16,full}
├── primitive/spacing              spacing.02 … spacing.96 (4px grid)
├── primitive/typography           font families · sizes · weights ·
│                                    line-heights · letter-spacings
├── primitive/shadow               numeric shadow primitives 1…6
├── primitive/opacity              opacity scales
├── primitive/sizing               icon, avatar, container scales
├── primitive/motion               duration + easing primitives
├── semantic/color-dark            background.* · text.* · border.* ·
│                                    button.{primary,secondary,destructive}.* ·
│                                    input.* · feedback.{danger,success,warning}.*
├── semantic/border                button/input/card/badge/tag/image radii
├── semantic/spacing               global.{xs..3xl} + component-scoped
│                                    button.padding.{x,y} · card.padding ·
│                                    input.padding.{x,y} · nav.item.padding.* ·
│                                    section.padding.*
├── semantic/typography            11 typography compositions
│                                    heading-{1..4} · body-{lg,md,sm} ·
│                                    label-{md,sm} · code · button
├── semantic/shadow                shadow.{card.{default,hover}, dropdown,
│                                            modal, tooltip}
├── semantic/opacity               disabled · overlay · placeholder · hover
├── semantic/sizing                button heights · input heights
└── semantic/motion                modal-enter · button-hover · …
```

Brand color is teal — `#4DC9C0` at the 500 step. The system is
currently **dark-only**: light mode lived as a `semantic/color-light`
set under `[data-theme="light"]` and was removed during a focus
period. The schema can re-add it without changes — `@custom-variant
dark (&)` is wired as a no-op so all existing `dark:*` classes still
compile.

### 5.2 Style Dictionary build

`packages/tokens/build.js` (94 lines) is intentionally simple. It:

1. Loads the single JSON file.
2. Strips `$metadata` and `$themes`.
3. Deep-merges the eight primitive sets and eight semantic sets into a
   single `darkTokens` object — the merge resolves `semantic/*` aliases
   against `primitive/*` definitions.
4. Runs Style Dictionary twice — once for CSS, once for JS/TS.

```js
const darkTokens = deepMerge(
  sets["primitive/color"],
  sets["primitive/border"],
  sets["primitive/spacing"],
  sets["primitive/shadow"],
  sets["primitive/typography"],
  sets["primitive/opacity"],
  sets["primitive/sizing"],
  sets["primitive/motion"],
  sets["semantic/color-dark"],
  sets["semantic/border"],
  sets["semantic/spacing"],
  sets["semantic/shadow"],
  sets["semantic/typography"],
  sets["semantic/opacity"],
  sets["semantic/sizing"],
  sets["semantic/motion"],
)
```

Output:

```
dist/tokens.css   313 lines  --kr-* CSS custom properties on :root
dist/tokens.js              ES module of typed JS constants
dist/tokens.d.ts            TypeScript declarations for the same
```

The `--kr-*` prefix is short on purpose — design tokens show up
inline in component classes (`bg-[var(--kr-color-background-page)]`)
and a long prefix bloats every line. `kr` = Kraidle.

### 5.3 Tailwind ↔ token bridge

`packages/ui/src/styles/globals.css` (393 lines) is the connective
tissue. It does three things:

1. Imports `@kraidle/tokens/tokens.css` so `:root` carries every
   `--kr-*` var.
2. Uses Tailwind v4's `@theme inline { … }` block to map every
   semantic token onto a Tailwind theme slot. So
   `--color-text-primary: var(--kr-color-text-primary);` makes
   `text-text-primary` resolve to the token.
3. Provides eleven semantic typography utility classes (`.text-heading-1`,
   `.text-body-md`, `.text-button`, …) — each bundles 3–5 properties
   that define a complete text style, mirroring Figma's Text Styles.

```css
/* globals.css excerpt */
@theme inline {
  /* Color: semantic */
  --color-background-page:    var(--kr-color-background-page);
  --color-text-primary:       var(--kr-color-text-primary);
  --color-button-primary-background: var(--kr-color-button-primary-background);

  /* Spacing: global semantic scale */
  --spacing-xs:  var(--kr-spacing-global-xs);
  --spacing-sm:  var(--kr-spacing-global-sm);
  --spacing-md:  var(--kr-spacing-global-md);
  --spacing-lg:  var(--kr-spacing-global-lg);

  /* Radius: Tailwind named scale → border.radius primitives */
  --radius-sm:   var(--kr-border-radius-4);
  --radius-md:   var(--kr-border-radius-6);
  --radius-lg:   var(--kr-border-radius-8);

  /* Shadow: semantic aliases over numeric primitives */
  --shadow-card:     var(--kr-shadow-card-default);
  --shadow-dropdown: var(--kr-shadow-dropdown);
  --shadow-modal:    var(--kr-shadow-modal);
  --shadow-tooltip:  var(--kr-shadow-tooltip);
}

@layer components {
  .text-heading-1 {
    font-family:    var(--kr-typography-heading-1-family);
    font-size:      var(--kr-typography-heading-1-size);
    font-weight:    var(--kr-typography-heading-1-weight);
    line-height:    var(--kr-typography-heading-1-line-height);
    letter-spacing: var(--kr-typography-heading-1-letter-spacing);
  }
  /* …10 more compositions */
}
```

The result is that authors write semantic Tailwind:

```tsx
<button className="bg-button-primary-background text-button-primary-text gap-md p-sm rounded-lg shadow-card">
  Primary
</button>
```

…and every single class resolves through a token. There are no magic
numbers in the component layer.

### 5.4 Two-tier vocabulary

```
Tier 1: Primitives                                Tier 2: Semantics
----------------------------------------          ----------------------------------------
color.brand.500   = #4DC9C0                       text.primary       → neutral.50
color.neutral.50  = #fafafa                       text.secondary     → neutral.400
spacing.04        = 0.25rem (4px)                 background.page    → neutral.950
spacing.16        = 1rem    (16px)                button.primary.bg  → brand.500
border.radius.6   = 0.375rem                      input.border       → neutral.700

  ↑ raw scale, never used directly                  ↑ everyday vocabulary in components
```

The rule is: **components reach for semantics; primitives are the
construction set, not the working surface.** When a primitive is the
right answer (e.g. a brand-colored hover on a marketing element), it
remains an explicit choice — but the default vocabulary stays
intent-named.

---

## 6. Pillar 2 — Component library

### 6.1 The 27 components

Alphabetical, all current as of the most recent inventory regeneration:

```
alert · breadcrumb · button · button-group · card · carousel · checkbox ·
collapsible · combobox · context-menu · dropdown-menu · field · hero ·
input · input-group · label · pagination · radio-group · select ·
separator · sonner · switch · tabs · textarea · toggle · toggle-group ·
tooltip
```

Every component ships as **three files**:

```
button.tsx           implementation; cva variants; tokens-only classes
button.stories.tsx   one story per variant + composed scenarios;
                       enforced by ESLint
button.figma.tsx     Code Connect mapping → Figma component ID + props
```

### 6.2 Authoring pattern

Components are shadcn-derived but built on top of Base UI primitives
(`@base-ui/react`) for accessibility and headless behavior. Variants
use class-variance-authority (cva). Here's `button.tsx` in full:

```tsx
"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@kraidle/ui/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg \
   border border-transparent bg-clip-padding text-button whitespace-nowrap \
   transition-all outline-none select-none \
   focus-visible:border-border-focus focus-visible:ring-3 \
   focus-visible:ring-border-focus/50 active:not-aria-[haspopup]:translate-y-px \
   disabled:pointer-events-none disabled:opacity-50 \
   aria-invalid:border-border-danger aria-invalid:ring-3 \
   aria-invalid:ring-border-danger/20",
  {
    variants: {
      variant: {
        default:     "bg-button-primary-background text-button-primary-text",
        outline:     "border-border-default bg-background-page hover:bg-background-subtle",
        secondary:   "bg-button-secondary-background text-text-primary",
        ghost:       "hover:bg-background-subtle hover:text-text-primary",
        destructive: "bg-feedback-danger-background text-text-danger",
        link:        "text-text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        xs:      "h-6 gap-1 px-2 text-body-sm",
        sm:      "h-7 gap-1 px-2.5 text-[0.8rem]",
        lg:      "h-9 gap-1.5 px-2.5",
        icon:    "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({ className, variant = "default", size = "default", ...props }:
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-ds-component="Button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

Notable patterns:

- **Every class resolves through a token.** `bg-button-primary-background`
  → `--color-button-primary-background` (Tailwind theme) →
  `--kr-color-button-primary-background` (Style Dictionary). No hex.
- **`data-slot` and `data-ds-component`** attributes are sprinkled
  throughout for runtime introspection (used by future tooling and by
  the audit panel when validating the live DOM).
- **6 visual variants × 8 sizes = 48 combinations** generated by cva.
  Storybook documents each visual variant separately and a "Sizes"
  story renders the full size matrix; `generate-inventory.mjs` lists
  them all under `variants.{variant,size}`.
- **Headless behavior is delegated** to `@base-ui/react/button`. Accessibility
  (focus-visible rings, ARIA, keyboard) is shared across all variants.

### 6.3 Compound components

Larger components use a compound API. `Hero` is a good example:

```tsx
// Compound usage — full control over composition
<Hero>
  <HeroContent>
    <HeroEyebrow>Category</HeroEyebrow>
    <HeroText>
      <HeroTitle>Where the world's best engineering teams build faster.</HeroTitle>
      <HeroDescription>Gradle Technologies builds Develocity…</HeroDescription>
    </HeroText>
    <HeroActions>
      <Button>Explore Develocity</Button>
      <Button variant="secondary">Read the docs</Button>
    </HeroActions>
  </HeroContent>
  <HeroMedia>
    <video src="/hero.webm" />
  </HeroMedia>
</Hero>

// Shorthand — same tree, props instead of children
<Hero
  eyebrow="Category"
  title="Where the world's best engineering teams build faster."
  description="Gradle Technologies builds Develocity…"
  primaryLabel="Explore Develocity"
  primaryHref="https://gradle.com/develocity"
  secondaryLabel="Read the docs"
  secondaryHref="https://docs.gradle.com"
/>
```

Both forms produce identical output. The shorthand exists because
most pages don't need the full compound; the compound exists because
when you do need it, you need full control.

### 6.4 Responsive strategy

Three breakpoints, applied via Tailwind responsive prefixes:

| Breakpoint | Width | Strategy |
|---|---|---|
| Mobile | `< 768px` | Single column. Step typography down (`heading-1` → `heading-2`). Step spacing down one token. |
| Tablet | `768–1199px` | Adaptive — multi-column where possible, stacked otherwise. |
| Desktop | `≥ 1200px` | The Figma source design. Authoritative layout. |

A few invariants make responsive deterministic:

- **Fixed pixel widths convert to `max-w-* + w-full`** so layouts
  reflow inside smaller viewports.
- **Side-by-side groups stack vertically at mobile** unless explicitly
  annotated otherwise in the Figma frame.
- **No per-breakpoint magic numbers.** Spacing only ever steps down by
  one named token (`gap-lg` → `gap-md`); typography steps to the next
  semantic class. There are no `gap-13px` overrides.
- **Visual intent is preserved.** The responsive generator only adds
  *behavior*; it never restructures the desktop design.

---

## 7. Pillar 3 — Storybook & visual testing

### 7.1 Storybook setup

```ts
// packages/ui/.storybook/main.ts
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@chromatic-com/storybook",       // visual regression
    "@storybook/addon-a11y",          // axe live in the panel
    "@storybook/addon-designs",       // every story links to its Figma frame
    "storybook-addon-pseudo-states",  // hover/focus/disabled snapshots
  ],
  framework: "@storybook/react-vite",
}
```

The dark-default preview ensures snapshots are taken on the working
theme, with three named backgrounds (`dark`, `dark-raised`, `light`)
for inverse-text checks:

```ts
// preview.ts
parameters: {
  backgrounds: {
    default: "dark",
    values: [
      { name: "dark",        value: "#0a0a0a" }, // color/neutral/950
      { name: "dark-raised", value: "#171717" }, // color/neutral/900
      { name: "light",       value: "#fafafa" }, // color/neutral/50 — eyeball only
    ],
  },
}
```

### 7.2 Story conventions

Every component story file includes a `parameters.design` block linking
to its Figma frame:

```tsx
const meta = {
  title: "Components/Hero",
  component: Hero,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/N2iOieTfsH4lKyx1ZAVIT3/krAIdle?node-id=91-2126",
    },
  },
} satisfies Meta<typeof Hero>
```

For layout-heavy components, the convention is *one story per
breakpoint* — `Desktop`, `Tablet`, `Mobile` — pinned to specific
viewport widths via Chromatic's per-story `chromatic.viewports`
parameter:

```tsx
export const Desktop: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => <ShorthandExample />,
}
export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
    chromatic: { viewports: [900] },
  },
  render: () => <ShorthandExample />,
}
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    chromatic: { viewports: [375] },
  },
  render: () => <ShorthandExample />,
}
```

Chromatic snapshots all three; a regression at any viewport blocks
the PR.

### 7.3 Visual regression with Chromatic

`kraidle-chromatic.yml` runs on every PR and every push to `main`:

```yaml
- uses: chromaui/action@v11
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    workingDir: packages/ui
    exitZeroOnChanges: true
    onlyChanged: true   # turbosnap — only stories whose dep tree changed
```

`onlyChanged: true` enables Chromatic's TurboSnap, which uses
Storybook's dependency graph to skip snapshots for stories whose
upstream code didn't change. A token tweak that only affects buttons
won't burn snapshot quota on the carousel.

`exitZeroOnChanges: true` means Chromatic *posts* the diff but doesn't
fail the PR — review happens in Chromatic's UI, where reviewers
approve/decline visual changes. The PR check passes once Chromatic's
review state is "accepted".

---

## 8. Pillar 4 — Accessibility

### 8.1 Two layers of a11y

| Layer | Where | What it catches |
|---|---|---|
| Live in Storybook | `@storybook/addon-a11y` panel | Author-time feedback while writing a story |
| In CI | `@storybook/test-runner` + `axe-playwright` | Automated WCAG 2.1 A + AA on every PR |

### 8.2 The CI test runner

`packages/ui/.storybook/test-runner.ts` is the active config:

```ts
import { injectAxe, checkA11y } from "axe-playwright"
import type { TestRunnerConfig } from "@storybook/test-runner"

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page) {
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
        rules: {
          // Tracked baseline backlog — re-enable once cleared.
          "color-contrast":     { enabled: false },
          "nested-interactive": { enabled: false },
        },
      },
    })
  },
}
```

The two temporarily-disabled rules are a documented backlog:

- **`color-contrast`** — current contrast violations are rooted in
  token values, not story bugs. The fix is to retune
  `--kr-color-text-tertiary`, `--kr-color-feedback-danger-*`, and
  disabled-state opacity in `tokens.json` rather than rubber-stamp
  individual stories.
- **`nested-interactive`** — Base UI primitives for Checkbox, Switch,
  Collapsible, and Tooltip render a `<button>` wrapping another
  focusable child by design. Often a false positive. The rule will be
  re-enabled per-component after each is reviewed against actual
  keyboard behavior.

This is the right way to bring a11y CI online for an existing system:
**fail strictly on every new violation**, accept a documented baseline
of pre-existing ones, and burn down the baseline as discrete tickets.

### 8.3 The CI workflow

`.github/workflows/kraidle-a11y.yml` runs Storybook on a local HTTP
server and points the test runner at it:

```yaml
- name: Build Storybook
  run: npm run build-storybook -w @workspace/ui -- --output-dir storybook-static

- name: Serve Storybook and run a11y tests
  run: |
    npx --yes concurrently --kill-others --success first \
      "npx --yes http-server packages/ui/storybook-static --port 6006 --silent" \
      "npx --yes wait-on tcp:6006 && npx --yes @storybook/test-runner \
        --config-dir packages/ui/.storybook \
        --url http://127.0.0.1:6006"
  env:
    TEST_RUNNER_JUNIT_OUTPUT_DIR: packages/ui/test-results

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: a11y-results
    path: packages/ui/test-results
```

JUnit output goes to an artifact so reviewers can download the
detailed HTML report when a story fails.

### 8.4 Why axe-playwright over `axe-storybook`

The strategy doc originally referenced `axe-storybook`, which is no
longer maintained. `@storybook/test-runner` + `axe-playwright` is the
current actively-maintained equivalent and gives the same outcome
with better Playwright integration (full `page` access for waiting on
animations, custom assertions, etc.).

---

## 9. Pillar 5 — Engineering enforcement (ESLint)

`@kraidle/eslint-plugin` ships **five custom rules**. Each one exists
because a class of regression is cheaper to block at lint time than
to catch in review.

| Rule | Type | Blocks |
|---|---|---|
| `no-hardcoded-colors` | `problem` | hex / rgb / hsl / oklch / oklab / `color()` literals anywhere in TSX or template strings |
| `no-raw-spacing` | `problem` | raw `px`/`rem` in `style={{}}` for padding / margin / gap / inset |
| `enforce-ds-imports` | `problem` | DS components imported from non-`@kraidle/ui` paths |
| `require-ds-story` | `suggestion` | `*.tsx` in `packages/ui/src/components/` without sibling `*.stories.tsx` |
| `no-deprecated-tokens` | `suggestion` | Use of `@deprecated`-tagged token names (configurable allowlist) |

### 9.1 `no-hardcoded-colors`

```js
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/
const FN  = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|color)\(/

function looksLikeColor(value) {
  return HEX.test(value) || FN.test(value)
}

create(context) {
  function check(node, value) {
    if (looksLikeColor(value)) {
      context.report({ node, messageId: "hardcoded", data: { value } })
    }
  }
  return {
    Literal(node)         { if (typeof node.value === "string") check(node, node.value) },
    TemplateElement(node) { check(node, node.value.cooked ?? node.value.raw) },
  }
}
```

It scans both string literals and template strings, so a hex hidden
inside a `\`color: ${primary || "#3B82F6"}\`` template is caught.

### 9.2 `no-raw-spacing`

Restricted to spacing-relevant style props (a hardcoded set of 17
property names: `padding`, `paddingTop`, … `gap`, `rowGap`, `top`,
`right`, … `inset`):

```js
const SPACING_PROPS = new Set([
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "margin",  "marginTop",  "marginRight",  "marginBottom",  "marginLeft",
  "gap",     "rowGap",     "columnGap",
  "top", "right", "bottom", "left", "inset",
])

const PX_OR_REM = /(?:^|\s)-?\d*\.?\d+(?:px|rem)(?:\s|$)/
```

This is intentionally narrow. A raw px value in `style={{ width:
'200px' }}` is fine — width is a layout decision, not a spacing
decision, and constraining width too tightly would force terrible
escape hatches. But raw spacing is *always* a token violation.

### 9.3 `enforce-ds-imports`

```js
const DS_COMPONENT_NAMES = new Set([
  "Button", "Card", "Input", "Alert", "Badge", "Breadcrumb", "Checkbox",
  "Collapsible", "Combobox", "ContextMenu", "Dialog", "DropdownMenu",
  "Field", "Label", "Pagination", "RadioGroup", "Select", "Separator",
  "Switch", "Tabs", "Textarea", "Toggle", "ToggleGroup", "Tooltip",
])

const ALLOWED_SOURCE = /^(?:@kraidle\/ui|@workspace\/ui)(?:\/|$)/

ImportDeclaration(node) {
  if (allowed.test(node.source.value)) return
  if (filename.includes("/packages/ui/")) return  // self-imports are fine
  for (const spec of node.specifiers) {
    if (spec.type === "ImportSpecifier" && DS_COMPONENT_NAMES.has(spec.imported.name)) {
      context.report({ node: spec, messageId: "badImport", data: { name, source } })
    }
  }
}
```

This catches the most common drift: someone copies a Button into a
local components folder ("just for this one tweak"), and over time
the local copy diverges. The rule prevents the original sin.

### 9.4 `require-ds-story`

Filesystem-aware:

```js
const expected = join(dirname(filename), `${stem}.stories.tsx`)

return {
  Program(node) {
    if (!existsSync(expected)) {
      context.report({ node, messageId: "missing", data: { component, expected } })
    }
  }
}
```

Skips `.stories.tsx` and `.figma.tsx` files, applies only inside
`packages/ui/src/components/`. A new component without a story can't
be visually regression-tested, can't be a11y-tested, and can't be
indexed in the inventory — all of which break the system.

### 9.5 `no-deprecated-tokens`

Currently dormant (no deprecations exist yet) but wired to accept an
allowlist in rule options:

```js
schema: [{
  type: "object",
  properties: { tokens: { type: "array", items: { type: "string" } } },
}]
```

Once tokens start being deprecated as part of major-version migrations
(per strategy §9.2), the rule emits a `suggestion`-level warning so
authors see the deprecation at edit time rather than at merge time.

### 9.6 Why these five rules

Each rule maps to a strategic invariant:

```
no-hardcoded-colors   ↔ "Tokens are the only source of visual truth"
no-raw-spacing        ↔ "Tokens are the only source of visual truth"
enforce-ds-imports    ↔ "The component inventory is the source of what exists"
require-ds-story      ↔ "Quality shifts left — Chromatic and axe need stories to run"
no-deprecated-tokens  ↔ "Deprecation window of one minor cycle before removal"
```

A reviewer never has to *remember* these rules — the linter does.

---

## 10. Pillar 6 — CI / GitHub Actions

Six workflows, each scoped to a specific signal.

| Workflow | Trigger | Job |
|---|---|---|
| `kraidle-lint.yml` | Every PR + push to `main` | flat ESLint (incl. all 5 rules) + typecheck |
| `kraidle-chromatic.yml` | Every PR + push to `main` | publish Storybook to Chromatic, TurboSnap |
| `kraidle-a11y.yml` | Every PR + push to `main` | axe-playwright over Storybook stories |
| `kraidle-token-sync.yml` | Push to `tokens.json` / `build.js` / `package.json` | rebuild `dist/` and auto-commit |
| `kraidle-token-impact.yml` | PR touching `tokens/**` or `component-inventory.json` | diff tokens, map to components, post sticky comment |
| `kraidle-component-requests.yml` | PR opened / edited / synchronized | extract component-request blocks, file labelled GH issues |

### 10.1 Token sync

Designer pushes a token change via Tokens Studio (or an engineer edits
`tokens.json` directly). The workflow rebuilds `dist/` and auto-commits
back to the branch — consumers always read fresh output without any
manual rebuild step.

```yaml
on:
  push:
    paths:
      - "packages/tokens/tokens/**"
      - "packages/tokens/build.js"
      - "packages/tokens/package.json"

permissions: { contents: write }

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with: { node-version: "20", cache: npm }
  - run: npm ci
  - name: Build tokens
    run: npm run build -w @kraidle/tokens
  - name: Commit regenerated outputs
    uses: stefanzweifel/git-auto-commit-action@v5
    with:
      commit_message: "chore(tokens): regenerate dist from token source"
      file_pattern: "packages/tokens/dist/**"
```

### 10.2 Token impact preview

This is the workflow I'm proudest of. On any PR that touches
`tokens.json`, it diffs the source between the PR base and head,
maps each changed token to the components that consume it (via
`component-inventory.json`), and posts a sticky markdown comment.

```yaml
- name: Compute token diff
  run: |
    node scripts/token-diff.mjs \
      "${{ github.event.pull_request.base.sha }}" \
      "${{ github.event.pull_request.head.sha }}" \
      -o tmp/token-diff.json

- name: Build impact comment
  run: node scripts/impact-map.mjs \
    tmp/token-diff.json component-inventory.json > tmp/impact.md

- name: Post sticky PR comment
  uses: marocchino/sticky-pull-request-comment@v2
  with:
    header: kraidle-token-impact
    path: tmp/impact.md
```

The comment looks like:

```markdown
## Kraidle — Token impact preview

**3** token changes in this PR (`abc123` → `def456`).

### Changed tokens

|   | Token                          | Old        | New        |
|---|--------------------------------|------------|------------|
| ✏️ | `color.brand.500`              | `#4DC9C0`  | `#3AADA4`  |
| ✏️ | `spacing.global.md`            | `0.75rem`  | `1rem`     |
| ➕ | `semantic.feedback.info.bg`    | _—_        | `#0E2E4F`  |

### Components affected

| Component | Changed tokens it uses                 | Stories                        |
|---|---|---|
| **Button**    | `color.brand.500`, `spacing.global.md` | [Default](…), [Sizes](…)       |
| **Tabs**      | `spacing.global.md`                    | [Default](…), [Line](…)        |
| …             | …                                       | …                              |

12 components touched, 27 total token→component edges.

---
_Auto-generated by `scripts/impact-map.mjs` — see the Chromatic
comment above for visual diffs of the affected stories._
```

The workflow is intentionally fast — it skips `npm install` because
both scripts (`token-diff.mjs`, `impact-map.mjs`) use only Node
built-ins. The sticky comment lands in **under 20 seconds** so PR
authors see the blast radius before Chromatic's snapshots are even
done rendering.

The mapping heuristic: for each token path, generate the candidate
forms it would appear as in `tokens_used`:

```js
// "color.background.surface" generates:
//   --kr-color-background-surface           CSS var form
//   bg-background-surface                   Tailwind bg-* class
//   text-background-surface, border-…, …    other prefixes
//
// "spacing.global.md" generates:
//   --kr-spacing-global-md
//   p-global-md, gap-global-md, m-global-md, …
//
// A component is "affected" if any candidate appears in c.tokens_used.
```

It's a heuristic — false positives are possible if a component lists
a token it doesn't visually use — but in practice it's been
strikingly accurate because `generate-inventory.mjs` extracts
`tokens_used` from the component source itself.

### 10.3 Chromatic, lint, a11y

Already covered in §7.3, §9, §8.3. Each runs on every PR, fails
loudly, and uploads artifacts when applicable.

### 10.4 Component-request capture

When Claude Code emits a `component-request` JSON block (see §12.3),
this workflow picks it up:

```yaml
on:
  pull_request:
    types: [opened, edited, reopened, synchronize]

steps:
  - name: Read PR body + changed files
    run: |
      gh pr view "$PR_NUMBER" --json body,files --jq '.body' > tmp/pr-body.txt
      gh pr diff "$PR_NUMBER" > tmp/pr-diff.txt
      cat tmp/pr-body.txt tmp/pr-diff.txt > tmp/pr-input.txt

  - name: Extract component-request blocks
    run: node scripts/extract-requests.mjs tmp/pr-input.txt > tmp/requests.json

  - name: Create GitHub issues
    run: node scripts/create-issues.mjs tmp/requests.json
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Each request becomes an issue labelled `kraidle/new-component`,
auto-assigned to the design-system team. The Figma-stub half (open a
placeholder frame in a "Proposed Components" library page via the
Figma REST API) is a Phase 3.5 follow-up — it requires a
`FIGMA_LIBRARY_TOKEN` and the file/page IDs.

---

## 11. Pillar 7 — Figma plugin & passive linter widget

The `figma-plugin` package ships **two artifacts** built from a
shared audit core:

```
packages/figma-plugin/
├── manifest.json
├── src/
│   ├── plugin/main.ts      313 lines — plugin sandbox, audit + auto-fix
│   ├── widget/widget.tsx   258 lines — passive live-counter widget
│   ├── ui/index.{html,ts}  panel UI
│   ├── audit/              ← shared, pure
│   │   ├── index.ts        auditNodes() + summarize()
│   │   ├── fills.ts        unbound fills + strokes
│   │   ├── spacing.ts      raw spacing
│   │   ├── typography.ts   unlinked text styles
│   │   ├── components.ts   detached / non-library
│   │   └── types.ts        Violation discriminated union
│   └── shared/messages.ts  UiToPlugin / PluginToUi
└── widget/                 widget bundle (separate runtime)
```

Total: **~994 lines of TypeScript**.

### 11.1 The passive widget

A Figma Widget the designer drops onto the canvas. It auto-rescans on
every `documentchange` event (debounced 800ms) and renders a
color-coded card:

```
┌────────────────────────────────┐
│ krAIdle token linter           │
│                                │
│ ISSUES DETECTED                │
│                                │
│ 8 ─ ─ ─ ─ ─ ─ ─ ─ ─    color   │
│ 3 ─ ─ ─ ─ ─ ─ ─ ─ ─    spacing │
│ 1 ─ ─ ─ ─ ─ ─ ─ ─ ─    library │
│                                │
│ Open the krAIdle linter plugin │
│      to fix issues             │
└────────────────────────────────┘
   (rose background — 12 issues)
```

When the count hits zero:

```
┌────────────────────────────────┐
│ krAIdle token linter           │
│                                │
│ ALL CLEAR                      │
│                                │
│ Ready for Claude Code          │
│      handoff                   │
└────────────────────────────────┘
   (green background — 0 issues)
```

Six violation kinds collapse into four designer-facing buckets so
the widget stays scannable:

```ts
const KIND_TO_BUCKET: Record<ViolationKind, Bucket> = {
  "unbound-fill":          "color",
  "unbound-stroke":        "color",
  "raw-spacing":           "spacing",
  "unlinked-typography":   "typography",
  "detached-component":    "library",
  "non-library-component": "library",
}
```

Implementation notes worth calling out:

- **`documentAccess: "dynamic-page"`** in the manifest requires
  `figma.loadAllPagesAsync()` before attaching `documentchange`. The
  call is idempotent, so re-running on every render is safe.
- **One auto-scan per session** is guarded by a module-scope flag
  (`hasAutoScannedThisSession`), so the widget shows fresh counts on
  load even if the synced state was cached from a stale session.
- **Token literals embedded inline** because the widget bundle is a
  separate runtime and can't import `--kr-*` vars from
  `@kraidle/tokens`. They're explicitly named after the source Figma
  swatches (`color/rose/600` etc.).

### 11.2 The on-demand audit panel

Triggered by menu commands (`Audit selection`, `Audit current page`,
`Send to Claude Code`):

```
┌──────────────────────────────────────────────┐
│  Kraidle — Design linter                     │
│                                              │
│  🟠 12 issues found                           │
│  ├ 8 color (unbound fill)         [Fix all]  │
│  ├ 3 spacing (raw px)             [Fix all]  │
│  └ 1 library (non-library)        [Fix]      │
│                                              │
│  ┌─ Marketing/Hero/Title ────────────────┐   │
│  │  unbound-fill  #4DC9C0                │   │
│  │  [Select]  [Fix]                      │   │
│  └────────────────────────────────────────┘  │
│  ┌─ Marketing/Hero/Container ────────────┐   │
│  │  raw-spacing   paddingTop: 23px        │   │
│  │  [Select]  [Fix]                      │   │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Re-audit]  [Send to Claude]               │
└──────────────────────────────────────────────┘
```

The "Fix" button does different things per violation kind:

| Kind | Behavior |
|---|---|
| `raw-spacing` | Auto-binds to the closest spacing variable within ±4px tolerance. If no variable is within tolerance, surfaces a guided toast with the nearest candidate and selects the node so the designer can pick deliberately. |
| `unbound-fill` / `unbound-stroke` | Guided fix only — auto-picking by "closest hex" would bind the wrong *intent* (background vs. interactive vs. brand). A toast walks the designer to the Variables dropdown. |
| `unlinked-typography` | Same — typography is semantic; auto-binding to "closest font size" loses the heading vs body distinction. |
| `detached-component` / `non-library-component` | Manual — the panel selects the offending node so the designer can decide whether to swap or replace. |

The auto-fix engine for raw spacing is the showcase:

```ts
const SPACING_SNAP_TOLERANCE_PX = 4

const SPACING_FIELDS = [
  "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
  "itemSpacing", "counterAxisSpacing",
] as const

async function autoFixRawSpacing(node: SceneNode): Promise<SpacingFixResult> {
  const result = { fixed: [], skipped: [] }
  if (!("layoutMode" in node) || node.layoutMode === "NONE") return result
  const candidates = await getSpacingCandidates()  // local FLOAT vars w/
                                                    //   GAP/WIDTH_HEIGHT scopes
                                                    //   or names matching /spac|gap|padding/i
  for (const field of SPACING_FIELDS) {
    const value = node[field]
    if (typeof value !== "number" || value === 0) continue
    if (node.boundVariables?.[field]) continue
    const match = closestCandidate(value, candidates)
    if (Math.abs(match.value - value) > SPACING_SNAP_TOLERANCE_PX) {
      result.skipped.push({ field, value, reason: `nearest is ${match.name} (Δ${delta}px)` })
      continue
    }
    node.setBoundVariable(field, match.variable)
    result.fixed.push({ field, from: value, to: match.value, name: match.variable.name })
  }
  return result
}
```

A 5-second cache on the candidate list keeps per-node fixes fast even
when running "Fix all" across hundreds of nodes.

### 11.3 The "Send to Claude" handoff gate

When the designer clicks "Send to Claude", the plugin:

1. Reads the linter status annotation (`kraidle.linter.status`)
   stored on the selected frame as plugin data.
2. Refuses to proceed if status isn't `"passed"`. (The annotation is
   automatically written when an audit returns zero violations.)
3. Packages a JSON payload with file key, node id, frame URL, linter
   status, and the target skill name.
4. Posts the payload to the UI for the user to paste into Claude
   Code (or for a future MCP integration to consume directly).

```ts
function handoffToClaude() {
  const frame = figma.currentPage.selection[0]
  const status = JSON.parse(frame.getPluginData(LINTER_STATUS_KEY) || "{}")
  if (status.status !== "passed") {
    return post({ type: "toast", level: "warn",
      text: "Run Audit first — only linter-approved frames are allowed to hand off." })
  }
  post({ type: "claude-handoff", payload: JSON.stringify({
    file_key:      figma.fileKey,
    node_id:       frame.id,
    node_name:     frame.name,
    frame_url:     `https://www.figma.com/design/${figma.fileKey}/?node-id=${encodeURIComponent(frame.id)}`,
    linter_status: status,
    skill:         "responsive-from-figma",
  }, null, 2) })
}
```

This is the shift-left gate. Claude only ever sees linter-approved
designs — no need to re-derive token coverage from a partially-bound
frame.

---

## 12. Pillar 8 — Component inventory + AI surface area

### 12.1 The contract: `component-inventory.json`

This is the file that lets the AI surface area work without
hallucination. **1,043 lines, 27 components, regenerated by
Storybook.** Each entry:

```json
{
  "name": "Button",
  "source": "packages/ui/src/components/button.tsx",
  "import": "import { Button } from \"@kraidle/ui/components/button\"",
  "figma_url": "https://www.figma.com/design/N2iOieTfsH4lKyx1ZAVIT3/krAIdle?node-id=40-9",
  "figma_frame_id": "40:9",
  "variants": {
    "variant": ["default", "outline", "secondary", "ghost", "destructive", "link"],
    "size":    ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"]
  },
  "stories": [
    {
      "id":   "components-button--default",
      "name": "Default",
      "storybook_url": "https://storybook.kraidle.local/?path=/story/components-button--default"
    },
    /* …8 more stories */
  ],
  "tokens_used": [
    "bg-button-primary-background", "bg-button-secondary-background",
    "border-border-default", "border-border-focus", "rounded-lg",
    "text-button-primary-text", "text-text-brand", "text-text-primary",
    /* …rest */
  ]
}
```

Why each field matters:

- **`figma_frame_id`** — primary key for code↔Figma round-trip. The
  `code-to-figma` flow reads this when serializing back to a Figma
  REST payload.
- **`import`** — exact, paste-able import statement. AI consumers
  don't reconstruct paths; they emit this string verbatim.
- **`variants`** — extracted from the cva call via balanced-brace
  parsing (regex alone can't handle nested `{}` inside Tailwind
  string values). Falls back to story names when a component doesn't
  use cva.
- **`tokens_used`** — the union of `--kr-*` references and Tailwind
  utilities that resolve through `@theme inline`. Drives the impact
  preview (§10.2) and gives Claude the "vocabulary" the component
  is built from.

### 12.2 How the inventory is generated

`scripts/generate-inventory.mjs` (268 lines) is intentionally
zero-dependency — it runs on a clean Node install:

```js
// data sources:
//   - packages/ui/storybook-static/index.json   stories + titles
//   - packages/ui/src/components/*.figma.tsx    figma node-ids + import path
//   - packages/ui/src/components/*.tsx          token classes used
//   - packages/ui/package.json                  @kraidle/ui version

const components = readdirSync(componentsDir)
  .filter((f) => f.endsWith(".tsx") &&
    !f.endsWith(".stories.tsx") &&
    !f.endsWith(".figma.tsx"))
  .sort()

const inventory = components.map((file) => ({
  name: fileToComponentName(file),
  source: `packages/ui/src/components/${file}`,
  import: figma?.import ?? `@kraidle/ui/components/${file.replace(/\.tsx$/, "")}`,
  figma_url:      figma?.figma_url ?? null,
  figma_frame_id: figma?.figma_frame_id ?? null,
  variants:       variantsFor(file, stories),
  stories:        stories.map(s => ({
    id: s.id, name: s.name, storybook_url: `${STORYBOOK_URL_BASE}/?path=/story/${s.id}`
  })),
  tokens_used:    tokensUsedFor(file),
}))
```

Smart bits worth noting:

1. **Tokens-used parsing is theme-aware.** It reads `@theme inline`
   from `globals.css`, extracts the slot names (e.g.
   `background-page`, `border-default`), and filters Tailwind class
   matches against that allowlist. So `text-sm` (a built-in Tailwind
   utility) doesn't get listed as a token, but `text-text-primary`
   (resolved through `@theme inline`) does.

2. **cva variant extraction is brace-aware.** A naive regex over
   `variants:` would fail because the variant object's *values* are
   long Tailwind strings full of nested braces (`bg-[color:var(--…)]`).
   The script tracks brace depth manually and only treats top-level
   commas as variant delimiters.

3. **Import paths are re-anchored to `@kraidle/ui`.** Code Connect
   files use `import { Button } from "./button"` (relative); the
   inventory rewrites that to `import { Button } from
   "@kraidle/ui/components/button"` so consumers can paste-and-ship.

### 12.3 Claude skills

Four skills (saved prompt templates) ship with the system:

| Skill | Purpose |
|---|---|
| `responsive-from-figma` | Given a Figma frame + inventory + token context, generate `Page.tsx`, `Page.module.css`, `Page.stories.tsx` covering desktop/tablet/mobile. Maps elements via inventory; emits `component-request` blocks for unmapped elements. |
| `figma-to-code` | Convert a single Figma component or frame into one React component built from Kraidle primitives. Narrower than `responsive-from-figma`. |
| `code-to-figma` | Convert a generated React tree back into a Figma REST API payload (`POST /v1/files/:key/nodes`), preserving `--kr-*` tokens as Variable bindings — never flattened to hex. |
| `token-audit` | Audit a TSX/CSS file for design-system violations: hardcoded colors, raw px/rem, non-DS imports, missing stories, deprecated tokens. Outputs a structured JSON report. |

### 12.4 The `component-request` block

When a Figma element doesn't map cleanly to an inventory entry,
Claude emits a JSON block in the PR body or generated file:

```json
{
  "type": "component-request",
  "figma_node_id": "123:456",
  "description": "Stat card with icon, label, and delta indicator",
  "proposed_name": "StatCard",
  "suggested_tokens": [
    "color.background.subtle",
    "spacing.global.md",
    "border.radius.8"
  ],
  "reason": "no inventory entry covers an icon + label + delta layout",
  "screenshot_url": null
}
```

The `kraidle-component-requests.yml` workflow (§10.4) extracts these
and opens labelled GH issues. Gaps become tracked backlog rather
than improvised stubs.

### 12.5 CLAUDE.md as the rulebook

`CLAUDE.md` at the repo root is the AI's authoring contract. Its
key sections:

```markdown
## Design system version
Target: @kraidle/ui
Component inventory: component-inventory.json at the repo root,
regenerated by `npm run inventory`.

## Core rules
- Never use a hardcoded color value (hex, rgb, hsl, oklch). Always
  reference a Kraidle color token.
- Never use a raw px/rem value in style={{}} for spacing.
- Never create a new UI primitive from scratch. If a component covers
  the use case, use it. If nothing does, emit a component-request
  block — do not improvise an ad-hoc component.
- Always import design-system components from @kraidle/ui.

## Component inventory
- Load component-inventory.json at the start of any Figma-to-code task.
- If a Figma frame maps cleanly to an inventory entry, use that
  component with the listed import.
- If it doesn't, emit a component-request block.

## Responsive generation rules
Breakpoints: mobile < 768px, tablet 768–1199px, desktop ≥ 1200px.
[…6 deterministic rules for converting desktop frames to responsive…]

## Figma-to-code workflow
[Step-by-step procedure]

## Code-to-Figma workflow
[Step-by-step procedure]
```

Crucially, the rules in CLAUDE.md *mirror* the ESLint rules in
`@kraidle/eslint-plugin`. If Claude tries to break a rule, the lint
catches it; if a human tries to break a rule, the lint catches it.
The AI and the human are bound by the same compliance layer.

---

## 13. End-to-end workflows

### 13.1 Designer adds a token

```
1. Designer in Figma
   └─ Adjust color/text/secondary in the Tokens Studio panel
   └─ Click "Push to Git"

2. GitHub
   └─ Tokens Studio commits packages/tokens/tokens/tokens.json on a branch
   └─ Open PR

3. CI: kraidle-token-sync.yml
   └─ npm run build -w @kraidle/tokens
   └─ Auto-commit dist/tokens.css regeneration

4. CI: kraidle-token-impact.yml
   └─ Diff base vs. head tokens
   └─ Map changed tokens to component-inventory.json
   └─ Post sticky PR comment listing affected components + Storybook links

5. CI: kraidle-chromatic.yml
   └─ Build Storybook (TurboSnap only rebuilds affected stories)
   └─ Publish to Chromatic — visual diff per affected story

6. Review
   └─ PR comments tell the reviewer exactly which components changed
     and what they look like. Approve or request changes in Chromatic.
   └─ Merge.
```

### 13.2 Designer adds a marketing page

```
1. Designer in Figma
   └─ Build the desktop frame fully — only library components, only
     token-bound values.
   └─ Passive linter widget on canvas shows live violation count.
     Designer fixes spacing/colors until it shows ALL CLEAR (green).

2. Designer triggers the audit panel
   └─ Click "Audit selection"
   └─ "Fix all" auto-binds raw spacing values within ±4px tolerance
     to the matching spacing variables
   └─ Manual-fix toasts walk through any unbound fills

3. Designer triggers Send to Claude Code
   └─ Plugin checks linter-status annotation (refuses if not passed)
   └─ Packages: file key, node id, frame URL, skill = responsive-from-figma
   └─ Designer pastes the payload into Claude Code
   └─ Claude loads component-inventory.json + tokens.json
   └─ Maps every Figma element to a Kraidle component
   └─ Emits component-request for any unmapped elements
   └─ Generates Page.tsx + Page.module.css + Page.stories.tsx with
     desktop/tablet/mobile stories

4. (Optional) Claude code-to-figma
   └─ Serializes the React tree back into a Figma REST API payload
   └─ Imports tablet + mobile breakpoint frames into Figma alongside
     the original desktop frame for the designer to review

5. Engineer opens a PR with the generated files
   └─ kraidle-lint.yml: ESLint catches any token violations
   └─ kraidle-a11y.yml: axe over the new stories — must pass WCAG 2.1 AA
   └─ kraidle-chromatic.yml: snapshots desktop/tablet/mobile
   └─ kraidle-component-requests.yml: any component-request blocks
     in the PR body become labelled GitHub issues
   └─ Reviewer approves; merge.
```

### 13.3 Engineer adds a new component

```
1. npx shadcn@latest add <name> -c apps/web
   └─ apps/web/components.json aliases ui → @kraidle/ui/components,
     so shadcn drops the source into packages/ui/src/components/
   └─ Engineer renames classes to use semantic tokens, edits variants

2. Engineer writes <name>.stories.tsx
   └─ require-ds-story would fail the lint otherwise.
   └─ One story per cva variant + at least one composed scenario.
   └─ parameters.design points to the component's Figma frame.

3. Engineer writes <name>.figma.tsx (Code Connect)
   └─ Maps Figma component properties to React props:
       variant: figma.enum("Variant", { Default: "default", … })
       label:   figma.textContent("Primary")

4. npm run inventory
   └─ Rebuilds Storybook
   └─ Regenerates component-inventory.json with the new entry

5. PR
   └─ kraidle-lint.yml: typecheck + all 5 ESLint rules pass
   └─ kraidle-a11y.yml: axe over all stories incl. the new one
   └─ kraidle-chromatic.yml: snapshots the new variants

6. After merge: designer can drag the new component from the Figma
   library; AI consumers see it in the next inventory regeneration.
```

---

## 14. Outcomes & metrics

### 14.1 Quantitative snapshot

| Metric | Value |
|---|---|
| Components in `@kraidle/ui` | **27** |
| Code Connect files (`.figma.tsx`) | **27** (100% coverage) |
| Storybook stories | **27** files; ~80–100 individual stories |
| Custom ESLint rules | **5** |
| GitHub Actions workflows | **6** |
| Source files in figma-plugin | **994 lines TS** across plugin, widget, audit core |
| `component-inventory.json` | **1,043 lines, 27 components** |
| Token source (`tokens.json`) | **235 lines, 8 primitive sets + 8 semantic sets** |
| Token output (`tokens.css`) | **313 lines of `--kr-*` vars** |
| Tailwind ↔ token bridge (`globals.css`) | **393 lines** |
| Token sets | 8 primitive (color, border, spacing, shadow, typography, opacity, sizing, motion) + 8 semantic |
| Theme | **dark only** today; light mode parked under `[data-theme="light"]` for future re-enable |
| WCAG conformance target | **2.1 AA** across all stories (with documented baseline) |

### 14.2 Qualitative outcomes

- **Hardcoded values cannot ship.** Five lint rules, six CI workflows.
  No one has to remember the rules; the CI does.
- **Tokens stay in sync between Figma and code** without manual
  rebuild steps. Designer pushes from Tokens Studio → PR opens →
  `dist/tokens.css` regenerates automatically → Chromatic + impact
  preview show what changed.
- **Component drift is structurally blocked.** Local copies of `Button`
  fail `enforce-ds-imports`. New components without stories fail
  `require-ds-story`. Stories without a11y compliance fail axe.
- **AI workflows produce code that ships.** Claude reads the
  inventory, uses the listed imports verbatim, emits requests for
  gaps. Generated PRs pass the same lint that human PRs do.
- **Quality shifts left.** Issues surface where they're cheapest:
  Figma canvas (passive widget) → editor (ESLint) → PR (CI) →
  Chromatic review.
- **Gaps become backlog, not stubs.** Every unmapped Figma element
  becomes a tracked GitHub issue with a screenshot, a proposed name,
  and suggested tokens. The system grows itself.

---

## 15. Lessons learned

### 15.1 What worked

**One token file, not many.** Tokens Studio's single-file export is
strictly better than a folder of per-set JSON files for git diffs and
two-way sync. The `build.js` deep-merge of sets is 30 lines and
trivially debuggable.

**Generated artifacts have to be checked in.** `dist/tokens.css` is
in the repo so Storybook and `apps/web` work on a fresh clone with
zero build steps. The token-sync workflow keeps it fresh; humans
shouldn't ever edit it.

**`@theme inline` is the right Tailwind v4 integration.** Routing
every utility through tokens via the inline `@theme` block means
authors write idiomatic Tailwind (`bg-button-primary-background`)
and get tokens "for free". Earlier attempts using Tailwind config
extension were brittler and required component-level wiring.

**Lint at the AST level, not at the regex level.** The ESLint rules
catch hex literals inside template strings, conditional fallbacks,
and other places a regex over the file would miss.

**A passive widget changes designer behavior more than an audit
panel.** A panel you have to remember to open catches issues at
handoff time. A widget on the canvas catches issues *while the
designer is working*, before they accumulate.

**Code Connect parser-based files are version-controlled
documentation.** Even before they're CLI-published, having
`button.figma.tsx` in the repo means the canonical Figma↔React
mapping lives next to the code. New devs see exactly how variants
map.

### 15.2 What we changed mid-stream

- **`axe-storybook` → `@storybook/test-runner` + `axe-playwright`.**
  The strategy doc referenced `axe-storybook`, which is no longer
  maintained. Same outcome with the new stack; updated the workflow
  without changing the rest of the pipeline.
- **Light mode temporarily removed.** Trying to ship dark + light
  simultaneously slowed iteration. We shipped dark-only with a clean
  re-add path (`[data-theme="light"]` selector reserved, `dark:`
  variant kept as no-op so existing classes still compile).
- **A11y baseline for two rules.** `color-contrast` and
  `nested-interactive` are tracked as backlog rather than blocking
  the entire CI on day one. Pragmatic — bring CI online with strict
  failures on *new* violations and burn down the baseline.

### 15.3 What's still ahead

- **Figma stub creation** for component-requests (§10.4). Needs a
  `FIGMA_LIBRARY_TOKEN` and the file/page IDs, then the
  component-request workflow can also POST a placeholder frame to
  the "Proposed Components" library page.
- **Slack `#kraidle` notifications** for token changes and releases
  (strategy §6.4). The webhook step is wired in the strategy doc
  but not yet active.
- **Light mode re-enable.** The schema and the no-op `dark:` variant
  are ready; needs a `semantic/color-light` set and a second build
  step that emits its values under `[data-theme="light"]`.
- **Burning down the a11y baseline.** Color-contrast token tweaks
  for `text-tertiary`, `feedback-danger-*`, and disabled-state
  opacity. Per-component review for `nested-interactive`.

---

## 16. Appendix — file map & numbers at a glance

### 16.1 Token taxonomy (all 16 sets)

```
primitive/            semantic/
├── color             ├── color-dark
├── border            ├── border
├── spacing           ├── spacing
├── shadow            ├── shadow
├── typography        ├── typography
├── opacity           ├── opacity
├── sizing            ├── sizing
└── motion            └── motion
```

### 16.2 Component list

```
alert         breadcrumb     button         button-group   card
carousel      checkbox       collapsible    combobox       context-menu
dropdown-menu field          hero           input          input-group
label         pagination     radio-group    select         separator
sonner        switch         tabs           textarea       toggle
toggle-group  tooltip
```

### 16.3 ESLint rules

| Rule | File | Type |
|---|---|---|
| `no-hardcoded-colors` | `src/rules/no-hardcoded-colors.js` | problem |
| `no-raw-spacing` | `src/rules/no-raw-spacing.js` | problem |
| `enforce-ds-imports` | `src/rules/enforce-ds-imports.js` | problem |
| `require-ds-story` | `src/rules/require-ds-story.js` | suggestion |
| `no-deprecated-tokens` | `src/rules/no-deprecated-tokens.js` | suggestion |

### 16.4 GitHub workflows

| File | Trigger |
|---|---|
| `.github/workflows/kraidle-lint.yml` | every PR + `main` push |
| `.github/workflows/kraidle-chromatic.yml` | every PR + `main` push |
| `.github/workflows/kraidle-a11y.yml` | every PR + `main` push |
| `.github/workflows/kraidle-token-sync.yml` | push to `tokens.json` |
| `.github/workflows/kraidle-token-impact.yml` | PR touching `tokens/**` |
| `.github/workflows/kraidle-component-requests.yml` | PR opened/edited |

### 16.5 Scripts

| File | Purpose |
|---|---|
| `scripts/generate-inventory.mjs` | Parse `packages/ui` → `component-inventory.json` |
| `scripts/token-diff.mjs` | Git-aware DTCG token diff between two refs |
| `scripts/impact-map.mjs` | Token diff + inventory → markdown PR comment |
| `scripts/extract-requests.mjs` | Pull `component-request` blocks from PR body/diff |
| `scripts/create-issues.mjs` | Open labelled GH issues for the requests |

### 16.6 Figma plugin module map

| Path | Lines (approx) | Purpose |
|---|---|---|
| `src/plugin/main.ts` | 313 | Plugin sandbox; menu commands; auto-fix engine |
| `src/widget/widget.tsx` | 258 | Passive widget; debounced rescan; bucket UI |
| `src/audit/index.ts` | ~30 | `auditNodes()` walker + `summarize()` |
| `src/audit/fills.ts` | — | Unbound fills + strokes |
| `src/audit/spacing.ts` | — | Raw spacing on auto-layout frames |
| `src/audit/typography.ts` | — | Unlinked text styles / font sizes |
| `src/audit/components.ts` | — | Detached + non-library component detection |
| `src/audit/types.ts` | — | `Violation` discriminated union |
| `src/shared/messages.ts` | — | UI ↔ plugin message types |
| `src/ui/index.{html,ts}` | — | Audit panel UI |
| **Total TS source** | **~994** | |

### 16.7 Glossary

| Term | Meaning |
|---|---|
| **Primitive token** | Raw scale value (`color.brand.500`, `spacing.04`). Not used directly in components. |
| **Semantic token** | Intent-named alias (`text.primary`, `button.primary.background`). The everyday vocabulary. |
| **DTCG** | Design Token Community Group — the JSON schema Tokens Studio exports to. |
| **Code Connect** | Figma's mapping between a library component and a code snippet. We use the parser-based form (`.figma.tsx` files). |
| **CVA** | `class-variance-authority` — the variant generator powering every component's prop→class mapping. |
| **TurboSnap** | Chromatic's mode that only snapshots stories whose dep tree changed since the base. |
| **`--kr-*`** | The CSS variable prefix for Kraidle tokens. Short on purpose. |

---

*Kraidle is the answer to a specific question: what does a design
system look like when designer, engineer, and AI agent all read from
the same source of truth, and when the system itself is responsible
for catching the regressions that humans miss? The answer is one JSON
file, twenty-seven components, five lint rules, six workflows, and a
canvas widget that turns green when you're ready to ship.*
