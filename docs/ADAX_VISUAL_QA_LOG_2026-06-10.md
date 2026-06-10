# ADAX Visual QA Log - 2026-06-10

Phase: 4 - Professional Market Immersion

## Checks Run

Quality gates:

- `npm run typecheck`: passed
- `npm run test`: passed, 36 tests
- `npm run build`: passed

Browser routes:

- `/scenarios?mode=execution`
- `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`
- `/workspace?mode=review&scenario=SCN-A-STD-001&participant=retailer`
- `/result?mode=execution&scenario=SCN-A-STD-001&participant=retailer`

## Desktop Evidence

Viewport target: `1512 x 745`.

- Scenario page market board exists and is visible in the first viewport.
- Execution workspace market board exists and is visible in the first viewport.
- Each checked market board renders 72 hourly price bars.
- Peak and valley bars are present for all three typical days.
- No horizontal overflow was detected.
- No clipped text was detected in the checked routes.
- Workspace spot-exposure node renders 4 exposure signals.
- Workspace settlement node renders 4 result signals and 4 cost-stack items.
- Settlement result page renders result signals, exposure signals, and cost-stack items without horizontal overflow.
- Execution result-review page renders the shared settlement signal board with 4 result signals, 4 exposure signals, 4 cost-stack items, 5 diagnosis focus rows, and a collapsed diagnostic-detail drawer.
- Execution result-review page has no horizontal overflow or clipped result text in the checked desktop viewport.
- Execution workspace context bar renders 5 cells at about `914 x 112` in a `1920 x 876` viewport.
- Execution workspace context, operation panel, and market board have no horizontal overflow or clipped checked text in the final desktop pass.
- Customer load node renders the shared primary action plus reference-feedback structure in the desktop workspace.
- Customer load desktop pass: primary action panel about `597 x 248`, reference feedback panel about `303 x 712`; three customer input cards rendered, annual service feedback updated to `105,000 MWh`, and no horizontal overflow or clipped checked text was detected.
- Package selection node renders the shared primary action plus reference-feedback structure in the desktop workspace.
- Package selection desktop pass: primary action panel about `597 x 274`, reference feedback panel about `303 x 727`; three package cards rendered, one package was selected, and no horizontal overflow or clipped checked text was detected.
- Annual bilateral node renders a primary action panel and a secondary reference-feedback panel in the desktop workspace.
- Annual bilateral desktop pass: primary action panel about `597 x 326`, reference feedback panel about `303 x 497`; primary action panel is wider, with no horizontal overflow or clipped checked text.
- Monthly auction node renders the same primary action plus reference-feedback structure in the desktop workspace.
- Monthly auction desktop pass: primary action panel about `597 x 919`, reference feedback panel about `303 x 669`; three monthly decision cards rendered, two participating windows revealed input grids, and no horizontal overflow or clipped checked text was detected.

## Mobile Evidence

Viewport target: `390 x 844`.

- Scenario page market board exists and stacks into one column.
- Review workspace market board exists on the market-brief node and stacks into one column.
- Each checked market board renders 72 hourly price bars.
- Peak and valley bars are present for all three typical days.
- No horizontal overflow was detected.
- No clipped text was detected in the checked routes.
- Settlement result page stacks into one readable column.
- `retail-output-grid` was fixed to collapse to one column at responsive breakpoints; before the fix, the mobile settlement board could be squeezed by the right-side panel.
- Execution result-review page stacks into one readable column at 390 x 844.
- Mobile sidebar collapsed state now reduces shell height to about 63px.
- Execution result-review signal board moved from about 1628px below the viewport top before the shell pass to about 840px after the shell pass.
- No horizontal overflow or clipped result-review text was detected in the checked mobile viewport.
- After the mobile flow-positioning pass, app topbar height is about 99px and step indicator height is about 58px at 390 x 844.
- Scenario market board appears at about 505px from the viewport top.
- Workspace market board appears at about 537px from the viewport top, down from about 1330px before the workspace ordering pass.
- Settlement result board appears at about 502px from the viewport top.
- Execution result-review board appears at about 466px from the viewport top.
- No horizontal overflow or clipped checked shell/flow/market/result text was detected in the updated mobile routes.
- Execution workspace context bar renders 5 cells as a contained horizontal strip at about `328 x 105` in a `390 x 844` viewport.
- The context strip has internal horizontal scrolling, but the document scroll width remains `390`; no page-level horizontal overflow was detected.
- Execution workspace market board appears at about `643px` from the viewport top after adding the compact context bar.
- Execution workspace context, operation panel, and market board have no clipped checked text in the final mobile pass.
- Customer load mobile pass: node workbench collapses to one `328px` column, primary action appears above reference feedback, three customer inputs rendered, and no horizontal overflow or clipped checked text was detected.
- Package selection mobile pass: node workbench collapses to one `328px` column, primary action appears above reference feedback, three package cards rendered, and no horizontal overflow or clipped checked text was detected.
- Annual bilateral mobile pass: node workbench collapses to one `328px` column, primary action appears above reference feedback, and no horizontal overflow or clipped checked text was detected.
- Monthly auction mobile pass: node workbench collapses to one `328px` column, primary action appears above reference feedback, three monthly decision cards rendered, and no horizontal overflow or clipped checked text was detected.

Observed mobile limitation:

- Market and result boards now enter the first mobile viewport area much earlier. A future pass can still reduce the combined shell and step height, but the active board is no longer buried below navigation.

## Console Logs

No browser console errors were observed in the final workspace-density and node-action-hierarchy passes.

## Responsive Split Check

Scope: engineering hardening pass for `src/styles/013-responsive.css` split by breakpoint and mobile sub-surface.

Commands:

- `npm run quality`: passed, including boundary check, typecheck, 36 tests, and build.
- Playwright viewport check against local Vite server at `http://127.0.0.1:5178/`.

Routes checked:

- `/`
- `/scenarios?mode=execution`
- `/workspace?mode=execution&scenario=SCN-A-STD-001&participant=retailer`

Desktop viewport: `1512 x 745`.

- All checked routes loaded with the expected ADAX page title.
- Home, scenario, and workspace pages reported no page-level horizontal overflow.
- Scenario route rendered market board evidence.
- Workspace route rendered both market board and workspace evidence.

Mobile viewport: `390 x 844`.

- All checked routes loaded with the expected ADAX page title.
- Home, scenario, and workspace pages reported `scrollWidth` equal to viewport width.
- Scenario route rendered market board evidence.
- Workspace route rendered both market board and workspace evidence.

Console:

- Playwright console check reported `Errors: 0, Warnings: 0`.
