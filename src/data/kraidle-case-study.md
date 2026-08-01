# Kraidle — A Connected, AI-Augmented Design System

Kraidle connects Figma, production code, and AI-assisted workflows through one
set of shared foundations and enforceable rules.

## Challenge

AI can make product teams faster, but it can also accelerate the problems a
design system is supposed to prevent.

I kept seeing the same three failure modes. Design and engineering maintained
parallel versions of components, so handoff became an exercise in
interpretation. Tokens documented the right decisions but did not prevent a
hardcoded color or spacing value from entering the product. AI coding tools
could produce a convincing interface quickly, yet bypass the component library
and create another one-off implementation.

The opportunity was not simply to add AI to a design system. It was to make the
system legible to people and machines, then give both the same path to
production.

> **Kraidle's core principle:** AI should accelerate a deterministic workflow,
> not replace it. The tokens, components, tests, and quality gates all work
> without an AI agent.

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
