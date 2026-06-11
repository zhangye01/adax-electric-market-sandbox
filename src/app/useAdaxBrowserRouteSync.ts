import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { AdaxFlowAccessState } from "../domain/adaxFlowGuards";
import {
  pathForPage,
  routeFromLocation,
  shouldReplaceMergedProductPath,
  shouldReplaceMissingRetailParticipant
} from "../routes/adaxRoutes";
import type { AdaxPageId, AdaxTrainingMode } from "../types";
import { getAdaxOutputRouteSyncDecision } from "./adaxRouteSyncDecisions";

export type AdaxRouteWriter = (page: AdaxPageId, nextMode?: AdaxTrainingMode | null, nextRole?: "retailer") => void;

interface UseAdaxBrowserRouteSyncParams {
  currentPage: AdaxPageId;
  mode: AdaxTrainingMode | null;
  selectedRole: "retailer";
  flowAccessState: AdaxFlowAccessState;
  settlementViewed: boolean;
  setCurrentPage: Dispatch<SetStateAction<AdaxPageId>>;
  setMode: Dispatch<SetStateAction<AdaxTrainingMode | null>>;
  setSelectedRole: Dispatch<SetStateAction<"retailer">>;
  setSettlementViewed: Dispatch<SetStateAction<boolean>>;
  setRecordSaved: Dispatch<SetStateAction<boolean>>;
}

export function useAdaxBrowserRouteSync({
  currentPage,
  mode,
  selectedRole,
  flowAccessState,
  settlementViewed,
  setCurrentPage,
  setMode,
  setSelectedRole,
  setSettlementViewed,
  setRecordSaved
}: UseAdaxBrowserRouteSyncParams) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    replaceMergedProductPath();
  }, []);

  useEffect(() => {
    function handlePopState() {
      const nextRoute = routeFromLocation();
      setMode(nextRoute.mode);
      setCurrentPage(nextRoute.page);
      if (nextRoute.role) setSelectedRole(nextRoute.role);
      setRecordSaved(false);
      replaceMergedProductPath();
      scrollToTop();
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setCurrentPage, setMode, setRecordSaved, setSelectedRole]);

  useEffect(() => {
    if (typeof window === "undefined" || !mode) return;
    const params = new URLSearchParams(window.location.search);
    if (!shouldReplaceMissingRetailParticipant(currentPage, mode, params.get("participant"))) return;

    replaceRoute(currentPage, mode, "retailer");
  }, [currentPage, mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const decision = getAdaxOutputRouteSyncDecision({
      currentPage,
      mode,
      selectedRole,
      flowAccessState,
      settlementViewed
    });

    if (decision.kind === "none") return;
    if (decision.kind === "markSettlementViewed") {
      setSettlementViewed(true);
      return;
    }

    setCurrentPage(decision.page);
    replaceRoute(decision.page, decision.mode, decision.role);
    scrollToTop();
  }, [currentPage, flowAccessState, mode, selectedRole, setCurrentPage, setSettlementViewed, settlementViewed]);

  function pushRoute(page: AdaxPageId, nextMode: AdaxTrainingMode | null = mode, nextRole: "retailer" = selectedRole) {
    if (typeof window === "undefined") return;
    const nextPath = pathForPage(page, nextMode, nextRole);
    if (`${window.location.pathname}${window.location.search}` !== nextPath) {
      window.history.pushState(null, "", nextPath);
    }
  }

  return {
    pushRoute,
    replaceRoute,
    scrollToTop
  };
}

export function readInitialAdaxRoute() {
  return routeFromLocation();
}

export function replaceRoute(page: AdaxPageId, nextMode: AdaxTrainingMode | null = null, nextRole: "retailer" = "retailer") {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", pathForPage(page, nextMode, nextRole));
}

export function scrollToTop(behavior?: ScrollBehavior) {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior });
}

function replaceMergedProductPath() {
  if (typeof window === "undefined") return;
  if (shouldReplaceMergedProductPath(window.location.pathname)) {
    window.history.replaceState(null, "", "/about");
  }
}
