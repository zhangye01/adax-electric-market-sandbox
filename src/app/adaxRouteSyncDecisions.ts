import { canAccessAdaxPage, fallbackAdaxPage, type AdaxFlowAccessState } from "../domain/adaxFlowGuards";
import type { AdaxPageId, AdaxTrainingMode } from "../types";

export type AdaxOutputRouteSyncDecision =
  | { kind: "none" }
  | { kind: "markSettlementViewed" }
  | {
      kind: "replaceRoute";
      page: AdaxPageId;
      mode: AdaxTrainingMode | null;
      role: "retailer";
    };

interface GetAdaxOutputRouteSyncDecisionParams {
  currentPage: AdaxPageId;
  mode: AdaxTrainingMode | null;
  selectedRole: "retailer";
  flowAccessState: AdaxFlowAccessState;
  settlementViewed: boolean;
}

export function getAdaxOutputRouteSyncDecision({
  currentPage,
  mode,
  selectedRole,
  flowAccessState,
  settlementViewed
}: GetAdaxOutputRouteSyncDecisionParams): AdaxOutputRouteSyncDecision {
  if (currentPage !== "settlement" && currentPage !== "review") return { kind: "none" };

  if (currentPage === "settlement" && canAccessAdaxPage("settlement", flowAccessState)) {
    return settlementViewed ? { kind: "none" } : { kind: "markSettlementViewed" };
  }

  if (canAccessAdaxPage(currentPage, flowAccessState)) return { kind: "none" };

  return {
    kind: "replaceRoute",
    page: fallbackAdaxPage(currentPage, flowAccessState),
    mode,
    role: selectedRole
  };
}
