import type { AdaxFlowAccessState } from "../domain/adaxFlowGuards";
import { calculateRetailSettlement } from "../domain/retailCalculations";
import type {
  RetailSettlementResult,
  RetailTrainingState,
  RetailValidationResult
} from "../domain/retailTypes";
import type { AdaxTrainingMode } from "../types";

type RetailSettlementCalculator = (state: RetailTrainingState) => RetailSettlementResult;

export function getRetailSessionSettlement(
  state: RetailTrainingState,
  validation: RetailValidationResult,
  calculateSettlement: RetailSettlementCalculator = calculateRetailSettlement
): RetailSettlementResult | null {
  if (!validation.ok) return null;

  try {
    return calculateSettlement(state);
  } catch {
    return null;
  }
}

interface GetAdaxSessionFlowAccessStateParams {
  mode: AdaxTrainingMode | null;
  retailDomainSettlement: RetailSettlementResult | null;
  executionResultGenerated: boolean;
  settlementViewed: boolean;
}

export function getAdaxSessionFlowAccessState({
  mode,
  retailDomainSettlement,
  executionResultGenerated,
  settlementViewed
}: GetAdaxSessionFlowAccessStateParams): AdaxFlowAccessState {
  return {
    mode,
    hasRetailSettlement: Boolean(retailDomainSettlement),
    executionResultGenerated,
    settlementViewed
  };
}
