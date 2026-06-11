import { useMemo, useState } from "react";
import { createEmptyRetailTrainingState } from "../domain/retailState";
import type { RetailTrainingState } from "../domain/retailTypes";
import { validateRetailTrainingState } from "../domain/retailValidation";
import type { AdaxPageId, AdaxTrainingMode, AdaxTrainingRecord, UserMaterial } from "../types";
import {
  getAdaxTrainingRecords,
  getAdaxUserMaterials
} from "../utils/adaxStorage";
import { getAdaxSessionFlowAccessState, getRetailSessionSettlement } from "./adaxSessionDerivations";
import { createAdaxTrainingActions } from "./createAdaxTrainingActions";
import { readInitialAdaxRoute, useAdaxBrowserRouteSync } from "./useAdaxBrowserRouteSync";

export function useAdaxTrainingSession() {
  const [initialRoute] = useState(() => readInitialAdaxRoute());
  const [currentPage, setCurrentPage] = useState<AdaxPageId>(initialRoute.page);
  const [mode, setMode] = useState<AdaxTrainingMode | null>(initialRoute.mode);
  const [selectedRole, setSelectedRole] = useState<"retailer">(initialRoute.role ?? "retailer");
  const [retailTrainingState, setRetailTrainingState] = useState<RetailTrainingState>(() => createEmptyRetailTrainingState());
  const [templateMessage, setTemplateMessage] = useState("");
  const [executionResultGenerated, setExecutionResultGenerated] = useState(false);
  const [settlementViewed, setSettlementViewed] = useState(false);
  const [recordSaved, setRecordSaved] = useState(false);
  const [records, setRecords] = useState<AdaxTrainingRecord[]>(() => getAdaxTrainingRecords());
  const [materials, setMaterials] = useState<UserMaterial[]>(() => getAdaxUserMaterials());

  const retailTrainingValidation = useMemo(
    () => validateRetailTrainingState(retailTrainingState),
    [retailTrainingState]
  );

  const retailDomainSettlement = useMemo(
    () => getRetailSessionSettlement(retailTrainingState, retailTrainingValidation),
    [retailTrainingState, retailTrainingValidation]
  );

  const flowAccessState = useMemo(
    () => getAdaxSessionFlowAccessState({
      mode,
      retailDomainSettlement,
      executionResultGenerated,
      settlementViewed
    }),
    [executionResultGenerated, mode, retailDomainSettlement, settlementViewed]
  );

  const routeSync = useAdaxBrowserRouteSync({
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
  });

  const actions = createAdaxTrainingActions({
    currentPage,
    mode,
    selectedRole,
    retailTrainingState,
    retailDomainSettlement,
    flowAccessState,
    materials,
    setCurrentPage,
    setMode,
    setSelectedRole,
    setRetailTrainingState,
    setTemplateMessage,
    setExecutionResultGenerated,
    setSettlementViewed,
    setRecordSaved,
    setRecords,
    setMaterials,
    pushRoute: routeSync.pushRoute,
    replaceRoute: routeSync.replaceRoute,
    scrollToTop: routeSync.scrollToTop
  });

  return {
    currentPage,
    mode,
    selectedRole,
    retailTrainingState,
    retailTrainingValidation,
    retailDomainSettlement,
    executionResultGenerated,
    templateMessage,
    setTemplateMessage,
    recordSaved,
    records,
    materials,
    canAccessPage: actions.canAccessPage,
    navigate: actions.navigate,
    chooseTrainingMode: actions.chooseTrainingMode,
    selectTrainingRole: actions.selectTrainingRole,
    saveExecutionRecord: actions.saveExecutionRecord,
    updateRetailTrainingState: actions.updateRetailTrainingState,
    generateExecutionResult: actions.generateExecutionResult,
    updateMaterial: actions.updateMaterial,
    saveReviewRecord: actions.saveReviewRecord,
    clearTrainingRecords: actions.clearTrainingRecords,
    revisitTrainingRecord: actions.revisitTrainingRecord
  };
}
