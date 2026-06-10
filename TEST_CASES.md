# ADAX v0.1 Test Cases

These cases describe the active v0.1 retail baseline. They intentionally exclude non-retailer operating flows until those flows receive their own startup card, domain model, and tests.

## Normal Cases

1. Retailer balanced execution
   - Select customer load contracts within each customer pool limit.
   - Select a retail package.
   - Use annual bilateral coverage between 80% and 120%.
   - Bid at or above the simulated counterparty floor price.
   - Select annual contract curve.
   - Choose participate / not participate for all three monthly auction windows.
   - Expected: workspace context shows current node, business stage, input/output artifact count, node status, and next action. Customer load, package selection, annual bilateral, and monthly auction nodes keep the user's primary operation visually dominant, with reference and feedback in secondary areas. Validation passes, settlement shows retail revenue, procurement cost, gross margin, spot exposure, risk level, and plain-language result interpretation without formula-heavy copy. Result surfaces state the virtual, training-grade, non-production boundary. Saving the execution record preserves decisions and result context for later local revisit.

2. Retailer review mode
   - Select review mode for retailer.
   - Enter the shared scenario and participant chain.
   - Add text in "my understanding" for a trade node.
   - Save review record.
   - Expected: records page shows review mode, material count, scenario, participant, and a review-mode summary rather than transaction profit. Saving the review record preserves a local material snapshot and revisits the review workspace. Review mode remains a node-bound knowledge workflow, not an execution result report.

3. Annual bilateral counterparty acceptance
   - Enter annual coverage ratio within 80%-120%.
   - Enter annual bid price below the simulated counterparty floor price.
   - Expected: validation blocks the annual bilateral node and states that the counterparty does not accept the price. The annual bilateral node keeps coverage ratio, bid price, and curve selection as the primary operation, with market reference and counterparty feedback in the secondary feedback area.

4. Market situation confirmation
   - Enter the unified virtual provincial market scenario.
   - Review annual price/load boundary, three monthly trading windows, and three 24-hour typical-day curves.
   - Expected: the market context remains ordered as annual situation, March/July/December monthly windows, and 24-hour typical days; the page does not require real province data or formula-heavy explanation before operation.

5. Settlement result hierarchy
   - Complete a retailer execution run and generate settlement.
   - Review revenue, procurement cost, gross margin, risk level, spot exposure, and cost stack on the settlement and execution result-review surfaces.
   - Expected: result surfaces share a clear hierarchy between经营结果、现货敞口 and成本结构; the display does not expose internal formula names or present the output as real settlement advice.

## Edge Cases

1. Retailer high coverage
   - Use annual coverage near 120%.
   - Participate in monthly auction for at least one month.
   - Expected: settlement completes and can diagnose over-locking or curve mismatch risk where applicable.

2. Retailer curve mismatch
   - Use total volume coverage at or near 100%.
   - Use contract curves that do not match the customer load curve.
   - Expected: settlement still shows positive/negative hourly spot exposure and risk adjustment because total volume coverage does not eliminate hourly mismatch.

3. Monthly auction opt-out
   - Mark at least one typical month as not participating.
   - Leave that month coverage, bid price, and curve empty.
   - Expected: validation accepts the opt-out month and calculates zero monthly volume for that month. The monthly auction node keeps the three participation decisions and revealed bid inputs as the primary operation, with window counts and reference ranges in the secondary feedback area.

4. Review mode empty materials
   - Enter review mode and try to save without entering text.
   - Expected: save is unavailable until at least one material is written or imported; it must not create fake transaction settlement output.

## Error Cases

1. Retailer customer load out of range
   - Enter a customer contract amount above that customer pool limit.
   - Expected: validation blocks the customer load node and names the offending customer segment.

2. Retailer contract price out of range
   - Enter annual bilateral price above the configured cap.
   - Expected: validation error names the annual bilateral price field.

3. Invalid monthly auction state
   - Mark a month as participating but provide an out-of-range bid price.
   - Expected: validation blocks settlement and names the month.

4. Skipped monthly auction with hidden details
   - Mark a month as not participating while coverage, bid price, or curve values remain in the state or imported template.
   - Expected: validation blocks the stale hidden state and requires skipped-month details to stay empty.

5. Invalid template
   - Upload JSON with missing required fields or invalid values.
   - Expected: imported data is not applied and errors are shown.

6. Corrupted local training records
   - Browser localStorage contains malformed or invalid training-record data.
   - Expected: records page ignores invalid entries instead of crashing, and valid records remain readable.

7. Route guard
   - Open the execution result route before generating settlement.
   - Expected: the app falls back to the proper available page instead of showing empty results.

8. Corrupted local review materials
   - Browser localStorage contains malformed or invalid review-material data.
   - Expected: review workspace ignores invalid entries instead of crashing, and valid node-bound materials remain readable.

9. Review-mode / result-review boundary
   - Open review mode and execution result review in separate flows.
   - Expected: review mode exposes materials and node knowledge organization, while execution result review exposes settlement statistics and training-record save. Review mode must not calculate transaction收益, and execution result review must not become a material workspace.
