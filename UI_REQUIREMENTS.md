# ADAX UI Requirements

This document records the required UI direction for the next major ADAX interface overhaul. It is a product-design constraint, not a casual style suggestion.

## Core Positioning

ADAX should feel like a professional electricity market transaction simulation cockpit.

It must not feel like:

- A generic admin dashboard.
- A static BI report.
- A government-style data screen.
- A showroom big-screen display.
- A fake sci-fi neon interface.
- A generic SaaS template.
- A wall of equally weighted metric cards.

It should feel like:

- A professional trading decision desk.
- A market situation observation cockpit.
- A strategy parameter control panel.
- A simulation and deduction workspace.
- A revenue and risk feedback system.
- A comparable, reviewable, iterative trading sandbox.

The intended tone is professional, calm, stable, credible, information-dense but orderly, with market sense, simulation sense, and control sense.

## Primary Judgment Chain

The first screen must help users naturally answer:

1. What is the current market situation?
2. What trading strategy am I using now?
3. What changes when I adjust parameters?
4. What is the simulation result?
5. Are revenue and risk acceptable?
6. Should I switch方案 and continue deduction?

The UI must be organized around this decision chain, not around component placement.

## Main Layout

Use a **left control - central market battlefield - right feedback** structure.

- Left: strategy controls, scenario choices, parameters, constraints, actions.
- Center: the primary market view, price/load/supply/clearing/result visualization.
- Right: revenue, risk, alerts, strategy explanation, sensitivity feedback.
- Bottom or secondary area:方案 comparison, historical simulation, event log, parameter changes, detail tables, review information.

Rules:

- The central market battlefield must be the visual focus.
- Left and right panels serve the center; they must not compete with it.
- Do not make all sections equally important.
- Do not build a full-screen grid of small cards.
- The first viewport must show a closed loop of market situation, strategy input, and result feedback.
- Detailed tables and logs should be secondary.

## Top Summary Area

The top area is a global situation summary, not decoration.

It should include selected items such as:

- Current simulation scenario.
- Market stage.
- Transaction type.
- Time range/current interval.
- Current round.
- Core status labels.
- Expected revenue.
- Clearing average price.
- Awarded/cleared energy.
- Deviation cost.
- Risk level.
- Strategy score or composite state.

Rules:

- Core numbers must stand out.
- Numbers and units must be visually layered; units are weaker than numbers.
- Metrics must have hierarchy.
- Status labels must be restrained.
- Users should understand in 3 seconds whether the situation is stable, revenue is attractive, and risk is rising.

## Left Strategy Control Area

The left side is the "how I plan to play" area.

It may include:

- Scenario selection.
- Trading period.
- Market stage.
- Load forecast parameters.
- Generation-side parameters.
- Demand-side parameters.
- Bidding strategy.
- Declaration energy.
- Price range.
- Risk preference.
- Constraint toggles.
- Run simulation.
- Reset parameters.
- Save/copy/compare方案.

Rules:

- It should feel like a control console, not a long form page.
- Controls should be grouped by business logic: scenario, strategy, constraints, operations.
- Primary inputs and primary action must stand out.
- Secondary actions should recede.
- Current scenario, selected strategy, and selected方案 must be obvious.
- Use consistent control height, spacing, radius, border, hover, and focus states.
- Prefer grouped controls, segmented controls, sliders, toggles, and compact inputs.
- Do not create a dense parameter wall.

## Central Market Battlefield

The center must contain one true main view. It cannot degrade into several equal small charts.

The main view should express one or more of:

- Time-series market prices.
- Day-ahead/real-time/spot price changes.
- Load and supply trend.
- Declaration curve and clearing result.
- Clearing price and成交电量.
- Time-of-day electricity price heatmap.
- Constraint trigger state.
- Current strategy position in the market.
- Current方案 vs baseline.
- Revenue/risk response to parameter changes.

Rules:

- The main chart must answer: what is the market situation now?
- Its area and visual weight must exceed normal cards.
- It must act like an analysis tool, not decoration.
- Titles, units, axes, legends, and state explanations must be clear.
- Current interval, current strategy, and current simulation result must be marked.
- Hover/selection/comparison/linkage feedback should be clear.
- Time dimension must be obvious.
- Chart color semantics must be stable.
- Avoid decorative 3D charts, pie charts, and low-judgment-value visuals.

## Right Result Feedback Area

The right side answers "what happens if I do this?"

It should include:

- Expected/simulated revenue.
- Deviation cost.
- Risk exposure.
- Award/clearing result.
- Cleared energy.
- Strategy explanation.
- Alerts and over-limit reminders.
- Sensitivity analysis.
- Current方案 strengths/weaknesses.
- Next-round focus.

Rules:

- It is not another chart pile; it explains results.
- Numeric results and causal explanation should be connected.
- Risk must be clear but not full-screen red.
- Alerts, prompts, abnormalities, and suggestions need hierarchy.
- Revenue improvement, risk increase, and constraint trigger must have distinct semantics.
- It should help users decide whether the current方案 should be kept.

## Bottom Review And Comparison Area

The bottom or secondary area is for deeper analysis.

It can contain:

-方案 A/B/C comparison.
- Historical simulation records.
- Parameter change log.
- Key event log.
- Per-round simulation result.
- Clearing details.
- Interval-level result table.
- Revenue decomposition.
- Risk source decomposition.

Rules:

- It can be dense, but must be scan-friendly.
- Important changes should be highlighted.
- It should support decision review, not become a dumping ground.
- Use tabs, collapses, drawers, or secondary pages when space is limited.

## Visual Style

Recommended direction:

- Dark modern trading desk.
- Calm energy dispatch system.
- Restrained data analysis workspace.
- Precise market simulation interface.

Avoid:

- Government-blue screens.
- Neon sci-fi dashboards.
- Low-quality gradient cards.
- Full-screen glowing lines.
- Marketing site style.
- Cute rounded style.
- Generic CRM/admin style.
- Template pages where every module is equally loud.

## Color Semantics

Establish unified tokens.

Suggested semantics:

- Background: dark graphite, dark blue-gray, near-black cool gray.
- Panel: slightly lighter than main background.
- Floating layer: one level lighter than panel.
- Dividers: low-contrast cool gray.
- Primary emphasis: electric blue, cyan-blue, or cool blue-green.
- Risk warning: orange.
- Serious risk/error: red.
- Positive/improved: green.
- Neutral: gray for units, descriptions, secondary states.

Discipline:

- Use one main accent family.
- Risk colors only where risk exists.
- Green should not be overused.
- Avoid large colorful cards.
- Do not use color as a replacement for information hierarchy.
- Chart colors and UI state colors must share semantics.

## Typography And Numbers

Rules:

- Use clear modern sans-serif fonts.
- Use tabular/monospace numeric behavior where possible for price, revenue, load, and time alignment.
- Core numbers should have higher weight than descriptive text.
- Units must remain visible but weaker.
- Decimal places and thousand separators must be consistent.
- Positive/negative changes must have clear semantics.
- Not all numbers should be equally prominent.

## Spacing And Components

Use a consistent spacing system:

- 4px: fine details.
- 8px: compact element spacing.
- 12px: group internals.
- 16px: card internals.
- 20/24px: section spacing.
- 32px: major divisions.

Component rules:

- Same-type cards, buttons, inputs, labels, titles, borders, and radii must be consistent.
- Borders should be light; shadows restrained.
- Do not use heavy shadows for cheap hierarchy.
- Use thin borders, background levels, spacing, and title structure to build order.

## Buttons And Actions

Action hierarchy:

1. Primary: run simulation, start deduction, apply strategy.
2. Secondary: save方案, copy方案, add to comparison.
3. Weak: reset, expand, view details.
4. Dangerous: clear, delete, abandon方案.

Rules:

- Primary action must be obvious.
- Secondary actions must not compete.
- Dangerous actions must not be confused with risk alerts.
- Hover, active, disabled, and loading states must be clear.
- Running simulation must provide visible feedback.

## States And Labels

States include:

- Current stage.
- Current scenario.
- Current方案.
- Risk level.
- Award/clearing state.
- Constraint state.
- Simulation state.
- Data state.

Rules:

- Labels should be small and clear.
- Avoid high saturation everywhere.
- Important states should be more prominent than ordinary labels.
- Current方案, historical方案, baseline方案, and recommended方案 must be distinguishable.

## Chart Requirements

Prefer:

- Time-series line charts.
- Price trend charts.
- Load/supply curves.
- Clearing result charts.
- Interval bands.
- Heatmaps.
- Bar comparisons.
-方案 comparison charts.
- Risk distribution charts.
- Sensitivity tornado charts.
- Constraint trigger matrices.
- Interval matrices.

Avoid:

- Pie charts.
- Pure gauges.
- Decorative 3D charts.
- Fake charts without data basis.
- Visually complex but low-decision-efficiency charts.
- Small charts only used to fill space.

Chart rules:

- The main chart must dominate.
- Text should be short but complete.
- Legend and units must be clear.
- Axes should be restrained but readable.
- Current values, peaks, risk bands, and abnormal points must be identifiable.
- Tooltips should help judgment, not just repeat values.
- Empty/loading/no-data states must be professional.

## Simulation Feel

The UI must feel like a sandbox, not a static report.

Simulation feel comes from:

- Parameter changes.
-方案 switching.
- Result linkage.
- Risk feedback.
- Historical comparison.
- Current方案 vs baseline difference.
- Simulation traces per round.

Implementation rules:

- Changing key parameters should visibly update the result area and main chart.
- Current方案 and baseline should preferably be compared.
- Running simulation should show calculating/updating state.
- After simulation, show a result summary.
- Risk increase, revenue decrease, and constraint trigger must be visible.
- Historical simulation records should be reviewable.

## Responsive Requirements

Desktop first:

- Optimize for 1440px+.
- Central battlefield has sufficient area.
- Left/right sidebars have stable widths.
- High information density without clutter.

Medium screens:

- Right feedback can move down or collapse.
- Left control can collapse.
- Central main chart remains priority.

Small screens:

- Full trading-desk experience is not required.
- Must not break.
- Order should be summary -> control -> main chart -> feedback -> review.

## Loading, Empty, Error States

Loading:

- Simulation running.
- Chart calculation.
- Data loading.
- Professional and restrained.

Empty:

- No selected scenario.
- No simulation run.
- No history records.
- No comparison方案.

Error:

- Data failed.
- Invalid parameters.
- Simulation failed.
- Chart render failed.

Rules:

- Copy must be concise and professional.
- Empty states should guide next action.
- Error states must explain cause and recovery.
- Do not expose raw technical errors.

## Accessibility And Maintainability

- Ensure color contrast.
- Hover/focus/selected states must be recognizable.
- Form controls need clear labels.
- Charts cannot rely only on color for risk.
- Styles should be tokenized where possible.
- Avoid scattered magic numbers.
- Component structure and naming should use business semantics.

## Acceptance Criteria

The completed UI overhaul must satisfy:

1. In 3 seconds, users know this is an electricity market trading simulation sandbox.
2. In 3 seconds, users see the central market battlefield.
3. In 3 seconds, users understand current market situation and core result.
4. Left control, central situation, and right feedback roles are clear.
5. The central main chart carries real market-situation expression.
6. The page feels like deduction/simulation, not static lookup.
7. Parameter changes,方案 switching, and simulation run have feedback.
8. Revenue and risk are clear.
9. Charts are more important than ordinary cards.
10. Color, typography, spacing, and component style are unified.
11. The overall style is professional, restrained, and credible.
12. It does not feel like a cheap big screen, admin template, or card pile.
13. Existing business functionality remains intact.
14. The project builds or passes available checks.

## Expected Delivery Format After UI Overhaul

When this UI overhaul is implemented, report:

1. Modified file list.
2. Core structural changes.
3. How the page implements left control - central battlefield - right feedback.
4. How market situation, strategy simulation, result feedback, and risk prompts were improved.
5. Verification commands and results.
6. Remaining enhancement opportunities.
