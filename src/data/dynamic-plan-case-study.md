# NYSHEX Dynamic Plan data management platform

Dynamic Plan turned complex ocean-shipping plan data into a workspace where carriers and shippers could understand performance, narrow the data to what mattered, and make updates without leaving the product.

> **My role:**  I led the design, prototyping, user testing, and worked directly with key stakeholders to steer the design in the right direction.  Additionally, as the creator and maintainer of NYSHEX's design system, I adapted and created new components as necessary.

---

## Overview

In late 2023, NYSHEX began a soft pivot toward a SaaS model built around two new products: Issue Log and Dynamic Plan. Dynamic Plan gave ocean carriers and shippers a way to segment and analyze operational data through layered filters, inspect changes over time, download data, and edit the underlying plan from a web interface.

The mental model was similar to an Excel pivot table, but purpose-built for shipping data and presented in a modern product experience. The design challenge was to preserve that analytical power without confronting every user with a wall of numbers.

## The starting point: V1

Dynamic Plan V1 launched in October 2023 as a large, editable table. It exposed a substantial amount of plan data, but user feedback showed that the density was overwhelming. The interface made the data available without making its meaning immediately clear.

![Dynamic Plan V1 shown as a large editable planning table](/assets/dynamic-plan-v1-overview.png)

### Viewing changes required too much navigation

To understand how the plan had changed, users first selected a version and waited for the table to update. Performance details and deeper insights lived in a separate modal, so comparing the overview with the underlying data required repeated context switching.

![Dynamic Plan V1 detail modal combining a chart and table](/assets/dynamic-plan-v1-detail-modal.png)

## V2: progress, but not enough

V2 replaced the table-first experience with a bar chart, a visualization pattern already familiar across NYSHEX. That made the data easier to scan, but it did not resolve the central workflow question: **How can I quickly filter the product down to only the data I need?**

![Dynamic Plan V2 using a chart-first view](/assets/dynamic-plan-v2-chart.png)

The table-versus-chart decision had improved comprehension, but filtering still felt separate from the work. That insight became the foundation for a third iteration.

## Constraints and a one-week timeline

The next iteration had a compressed schedule and a clear set of constraints:

- The data needed to be understandable to users with different levels of analytical experience.
- Filters needed to stay one or two clicks away.
- Charts had to accommodate potentially large data sets without becoming unreadable.
- The same filters had to update both the visualization and the editable table below it.
- I was still getting familiar with Dynamic Plan while its primary designer was on vacation.
- The design work had to be completed in one week and begin in Miro, NYSHEX’s standard starting point at the time.

I began wireframing in Miro on January 5 and delivered the high-fidelity direction on January 11. That schedule made it especially important to reuse established components and visual language instead of inventing an unrelated interface.

## V3: make the core workflow visible

V3 brought page-level filtering directly above each chart so the most important controls were always close to the data they affected. The charts gained reference lines, clearer labels, richer interaction, and a more useful color system. The editable table returned at the bottom of the same page, keeping analysis and action in one continuous view.

![Dynamic Plan V3 combining page-level filters, charts, and editable data](/assets/dynamic-plan-v3-overview.png)

This structure balanced two different needs: charts made patterns and variance easier to understand, while the table preserved the precision required for plan management.

## Two-click filtering

Each chart included a row of relevant filters. Selecting a control opened its options immediately, allowing users to narrow the current view without leaving the page or opening a separate configuration flow. In this example, the Status filter supports grouped, multi-select options for performed shipments and failures by either the shipper or carrier.

![The Status filter open above the Dynamic Plan performance chart](/assets/dynamic-plan-filtering.png)

Once a filter was applied, both the chart and the table updated to the same data set. This resolved a primary weakness in V2: users could remove irrelevant information quickly and trust that every part of the page reflected the same scope.

![Dynamic Plan filtered to failures by the shipper](/assets/dynamic-plan-filtered-view.png)

## Editing without the spreadsheet round-trip

Earlier versions pushed advanced edits into an export workflow: download the data to Excel, make changes, and upload it again. V3 added editing controls directly to the table. Users could enter an editing state by selecting a cell or using the Manage plan action, then review and save changes in context.

![Inline plan editing controls in the Dynamic Plan data table](/assets/dynamic-plan-editing.png)

Keeping editing beside the visualization shortened the distance between noticing a problem and correcting it, while the download option remained available for users who needed a spreadsheet-based workflow.

## Prototyping for stakeholder alignment

As soon as the high-fidelity screens were complete, I built a detailed Figma prototype for NYSHEX’s carrier and shipper teams, sales partners, and engineering leads. The prototype connected navigation, filters, chart states, and editing interactions so stakeholders could evaluate the workflow rather than a collection of static screens.

![Figma prototype connections for the Dynamic Plan filtering workflow](/assets/dynamic-plan-prototype.png)

That interactive walkthrough made the proposal concrete enough for teams with different priorities to discuss the same experience and resolve questions before implementation.

## Collaborating with engineering

Dynamic Plan was designed largely with Keel, the NYSHEX design system I created. Because the visual foundation and component patterns were already shared, the engineering handoff could focus on behavior: selection rules, nested filter states, persistence, chart updates, and the relationship between filtered data and table editing.

![Annotated engineering specifications for the Dynamic Plan multi-select filter](/assets/dynamic-plan-engineering-specs.png)

Detailed annotations documented the parts that a static screen could not communicate—for example, when a multi-select menu should close, how parent and child options behaved, and when a parent moved into an indeterminate state.

## Impact

The prototype was well received by internal stakeholders and by external representatives from ocean carriers and shippers. NYSHEX also used the prototype and high-fidelity designs in investor conversations while pursuing a Series C round.

Most importantly, V3 addressed the recurring friction revealed across the earlier versions: it replaced an intimidating table-first view with clearer visualization, kept robust filtering within reach, synchronized charts and tables around one data set, and allowed users to move from analysis to editing without leaving the product.
