import type { Dispatch, SetStateAction } from "react";
import { canAccessAdaxPage, fallbackAdaxPage, normalizeAdaxPage, type AdaxFlowAccessState } from "../domain/adaxFlowGuards";
import type { AdaxPageId, AdaxTrainingMode } from "../types";
import type { AdaxRouteWriter } from "./useAdaxBrowserRouteSync";

interface CreateAdaxNavigationActionsParams {
  mode: AdaxTrainingMode | null;
  flowAccessState: AdaxFlowAccessState;
  setCurrentPage: Dispatch<SetStateAction<AdaxPageId>>;
  setMode: Dispatch<SetStateAction<AdaxTrainingMode | null>>;
  setSettlementViewed: Dispatch<SetStateAction<boolean>>;
  setRecordSaved: Dispatch<SetStateAction<boolean>>;
  pushRoute: AdaxRouteWriter;
  resetOutputState: () => void;
  scrollToTop: (behavior?: ScrollBehavior) => void;
}

export function createAdaxNavigationActions({
  mode,
  flowAccessState,
  setCurrentPage,
  setMode,
  setSettlementViewed,
  setRecordSaved,
  pushRoute,
  resetOutputState,
  scrollToTop
}: CreateAdaxNavigationActionsParams) {
  function canAccessPage(page: AdaxPageId) {
    return canAccessAdaxPage(page, flowAccessState);
  }

  function navigate(page: AdaxPageId) {
    const normalizedPage = normalizeAdaxPage(page);

    if (normalizedPage === "home" || normalizedPage === "about" || normalizedPage === "records") {
      setMode(null);
      resetOutputState();
      pushRoute(normalizedPage, null);
      setCurrentPage(normalizedPage);
      scrollToTop("smooth");
      return;
    }

    if (normalizedPage === "start") {
      setMode(null);
      resetOutputState();
      pushRoute("start", null);
      setCurrentPage("start");
      scrollToTop("smooth");
      return;
    }

    if (!mode) {
      setCurrentPage("home");
      pushRoute("home", null);
      scrollToTop("smooth");
      return;
    }

    if ((normalizedPage === "settlement" || normalizedPage === "review") && mode === "review") {
      setCurrentPage("strategy");
      pushRoute("strategy", mode);
      scrollToTop("smooth");
      return;
    }

    if (!canAccessPage(normalizedPage)) {
      const fallbackPage = fallbackAdaxPage(normalizedPage, flowAccessState);
      setCurrentPage(fallbackPage);
      pushRoute(fallbackPage, mode);
      scrollToTop("smooth");
      return;
    }

    if (normalizedPage === "settlement") {
      setSettlementViewed(true);
    }
    pushRoute(normalizedPage, mode);
    setCurrentPage(normalizedPage);
    if (normalizedPage === "strategy") setRecordSaved(false);
    scrollToTop("smooth");
  }

  return {
    canAccessPage,
    navigate
  };
}
