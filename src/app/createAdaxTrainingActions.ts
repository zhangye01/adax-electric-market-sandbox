import type { Dispatch, SetStateAction } from "react";
import { adaxScenarioMeta } from "../data/adaxScenarioMeta";
import { getAdaxRecordRevisitTarget } from "../domain/adaxRecords";
import type { AdaxFlowAccessState } from "../domain/adaxFlowGuards";
import { canSaveRetailReviewRecord, mergeRetailReviewSnapshotMaterials } from "../domain/retailReviewMaterials";
import { createEmptyRetailTrainingState } from "../domain/retailState";
import type { RetailSettlementResult, RetailTrainingState } from "../domain/retailTypes";
import { saveRetailExecutionTrainingRecord, saveRetailReviewTrainingRecord } from "../services/adaxTrainingRecords";
import { upsertUserMaterial } from "../services/adaxUserMaterials";
import type { AdaxPageId, AdaxTrainingMode, AdaxTrainingRecord, UserMaterial } from "../types";
import { clearAdaxTrainingRecords, saveAdaxUserMaterials } from "../utils/adaxStorage";
import { createAdaxNavigationActions } from "./createAdaxNavigationActions";
import type { AdaxRouteWriter } from "./useAdaxBrowserRouteSync";

interface CreateAdaxTrainingActionsParams {
  currentPage: AdaxPageId;
  mode: AdaxTrainingMode | null;
  selectedRole: "retailer";
  retailTrainingState: RetailTrainingState;
  retailDomainSettlement: RetailSettlementResult | null;
  flowAccessState: AdaxFlowAccessState;
  materials: UserMaterial[];
  setCurrentPage: Dispatch<SetStateAction<AdaxPageId>>;
  setMode: Dispatch<SetStateAction<AdaxTrainingMode | null>>;
  setSelectedRole: Dispatch<SetStateAction<"retailer">>;
  setRetailTrainingState: Dispatch<SetStateAction<RetailTrainingState>>;
  setTemplateMessage: Dispatch<SetStateAction<string>>;
  setExecutionResultGenerated: Dispatch<SetStateAction<boolean>>;
  setSettlementViewed: Dispatch<SetStateAction<boolean>>;
  setRecordSaved: Dispatch<SetStateAction<boolean>>;
  setRecords: Dispatch<SetStateAction<AdaxTrainingRecord[]>>;
  setMaterials: Dispatch<SetStateAction<UserMaterial[]>>;
  pushRoute: AdaxRouteWriter;
  replaceRoute: AdaxRouteWriter;
  scrollToTop: (behavior?: ScrollBehavior) => void;
}

export function createAdaxTrainingActions({
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
  pushRoute,
  replaceRoute,
  scrollToTop
}: CreateAdaxTrainingActionsParams) {
  function resetOutputState() {
    setExecutionResultGenerated(false);
    setSettlementViewed(false);
    setRecordSaved(false);
  }

  const { canAccessPage, navigate } = createAdaxNavigationActions({
    mode,
    flowAccessState,
    setCurrentPage,
    setMode,
    setSettlementViewed,
    setRecordSaved,
    pushRoute,
    resetOutputState,
    scrollToTop
  });

  function chooseTrainingMode(nextMode: AdaxTrainingMode) {
    setMode(nextMode);
    setSelectedRole("retailer");
    setRetailTrainingState(createEmptyRetailTrainingState());
    setExecutionResultGenerated(false);
    setSettlementViewed(false);
    setRecordSaved(false);
    setTemplateMessage("");
    setCurrentPage("scenario");
    pushRoute("scenario", nextMode);
    scrollToTop("smooth");
  }

  function selectTrainingRole(nextRole: "retailer") {
    setSelectedRole(nextRole);
    setExecutionResultGenerated(false);
    setSettlementViewed(false);
    setRecordSaved(false);
    setTemplateMessage("");
    if (currentPage === "role" && mode) {
      replaceRoute("role", mode, nextRole);
    }
  }

  function saveExecutionRecord() {
    if (!retailDomainSettlement) return;
    setRecords(saveRetailExecutionTrainingRecord(retailTrainingState, retailDomainSettlement));
    setRecordSaved(true);
  }

  function updateRetailTrainingState(nextState: SetStateAction<RetailTrainingState>) {
    setRetailTrainingState(nextState);
    setExecutionResultGenerated(false);
    setSettlementViewed(false);
    setRecordSaved(false);
  }

  function generateExecutionResult() {
    if (!retailDomainSettlement) return;
    setExecutionResultGenerated(true);
    setSettlementViewed(false);
    setRecordSaved(false);
  }

  function updateMaterial(node: { id: string; title: string }, materialType: UserMaterial["materialType"], content: string) {
    const nextMaterials = upsertUserMaterial({
      materials,
      scenarioId: adaxScenarioMeta.id,
      participantType: selectedRole,
      node,
      materialType,
      content
    });
    setMaterials(nextMaterials);
    setRecordSaved(false);
  }

  function saveReviewRecord() {
    if (!canSaveRetailReviewRecord(materials, { scenarioId: adaxScenarioMeta.id, participantType: "retailer" })) return;
    setRecords(saveRetailReviewTrainingRecord(materials));
    setRecordSaved(true);
  }

  function clearTrainingRecords() {
    const confirmed = window.confirm("确定清空当前浏览器中的训练记录吗？该操作不会删除复盘工作台草稿材料。");
    if (!confirmed) return;
    setRecords(clearAdaxTrainingRecords());
    setRecordSaved(false);
  }

  function revisitTrainingRecord(record: AdaxTrainingRecord) {
    const target = getAdaxRecordRevisitTarget(record);
    if (!target) return;

    setMode(target.mode);
    setSelectedRole(target.roleId);
    setTemplateMessage("");
    setRecordSaved(true);

    if (target.mode === "execution" && record.execution) {
      setRetailTrainingState(record.execution.decisions);
      setExecutionResultGenerated(true);
      setSettlementViewed(target.page === "settlement" || target.page === "review");
      setCurrentPage(target.page);
      pushRoute(target.page, target.mode, target.roleId);
      scrollToTop("smooth");
      return;
    }

    if (target.mode === "review") {
      if (record.review) {
        setMaterials(saveAdaxUserMaterials(mergeRetailReviewSnapshotMaterials(materials, record.review)));
      }
      setExecutionResultGenerated(false);
      setSettlementViewed(false);
      setCurrentPage(target.page);
      pushRoute(target.page, target.mode, target.roleId);
      scrollToTop("smooth");
    }
  }

  return {
    canAccessPage,
    navigate,
    chooseTrainingMode,
    selectTrainingRole,
    saveExecutionRecord,
    updateRetailTrainingState,
    generateExecutionResult,
    updateMaterial,
    saveReviewRecord,
    clearTrainingRecords,
    revisitTrainingRecord
  };
}
