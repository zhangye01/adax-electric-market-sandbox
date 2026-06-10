import type { AdaxPageId, AdaxTrainingMode } from "../types";

export interface AdaxFlowAccessState {
  mode: AdaxTrainingMode | null;
  hasRetailSettlement: boolean;
  executionResultGenerated: boolean;
  settlementViewed: boolean;
}

export function normalizeAdaxPage(page: AdaxPageId): AdaxPageId {
  return page === "guide" ? "about" : page;
}

export function canAccessAdaxPage(page: AdaxPageId, state: AdaxFlowAccessState) {
  const normalizedPage = normalizeAdaxPage(page);

  if (normalizedPage === "home" || normalizedPage === "about" || normalizedPage === "start" || normalizedPage === "records") return true;
  if (!state.mode) return false;

  if (normalizedPage === "settlement") {
    return state.mode === "execution" && state.hasRetailSettlement && state.executionResultGenerated;
  }

  if (normalizedPage === "review") {
    return (
      state.mode === "execution" &&
      state.hasRetailSettlement &&
      state.executionResultGenerated &&
      state.settlementViewed
    );
  }

  return normalizedPage === "scenario" || normalizedPage === "role" || normalizedPage === "strategy";
}

export function fallbackAdaxPage(page: AdaxPageId, state: AdaxFlowAccessState): AdaxPageId {
  const normalizedPage = normalizeAdaxPage(page);
  if (normalizedPage === "review" && canAccessAdaxPage("settlement", state)) return "settlement";
  if (state.mode) return "strategy";
  return "home";
}
