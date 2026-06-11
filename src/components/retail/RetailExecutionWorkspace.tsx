import { useState, type Dispatch, type SetStateAction } from "react";
import { RetailExecutionContextBar } from "./RetailExecutionContextBar";
import { RetailExecutionNodeFooter } from "./RetailExecutionNodeFooter";
import { RetailExecutionNodeContent } from "./RetailExecutionNodeContent";
import { RetailExecutionResultPanel } from "./RetailExecutionResultPanel";
import { RetailNodeAssist } from "./RetailNodeAssist";
import { RetailNodeRail } from "./RetailNodeRail";
import { retailTrainingNodes } from "../../data/retailTrainingNodes";
import { calculateAnnualServiceMwh, calculateCustomerMix } from "../../domain/retailCalculations";
import { buildRetailExecutionWorkbenchContext } from "../../domain/retailExecutionWorkbench";
import { getRetailNodeValidationErrors } from "../../domain/retailNodeValidation";
import { createEmptyRetailTrainingState } from "../../domain/retailState";
import type {
  RetailNodeId,
  RetailSettlementResult,
  RetailTrainingState
} from "../../domain/retailTypes";
import { createRetailExecutionTemplateJson, parseRetailExecutionTemplate } from "../../services/retailExecutionTemplates";
import { downloadTextFile } from "../../utils/download";

interface RetailExecutionWorkspaceProps {
  state: RetailTrainingState;
  settlement: RetailSettlementResult | null;
  validationErrors: string[];
  resultGenerated: boolean;
  saved: boolean;
  onStateChange: Dispatch<SetStateAction<RetailTrainingState>>;
  onTemplateMessage: (message: string) => void;
  onGenerateResult: () => void;
  onNext: () => void;
}

export function RetailExecutionWorkspace({
  state,
  settlement,
  validationErrors,
  resultGenerated,
  saved,
  onStateChange,
  onTemplateMessage,
  onGenerateResult,
  onNext
}: RetailExecutionWorkspaceProps) {
  const [activeNodeId, setActiveNodeId] = useState<RetailNodeId>("marketBrief");
  const activeNode = retailTrainingNodes.find((node) => node.id === activeNodeId) ?? retailTrainingNodes[0];
  const activeErrors = getRetailNodeValidationErrors(activeNode.id, state, validationErrors);
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  const customerMix = calculateCustomerMix(state);
  const currentNodeIndex = retailTrainingNodes.findIndex((node) => node.id === activeNode.id);
  const nextNode = retailTrainingNodes[currentNodeIndex + 1] ?? null;
  const workbenchContext = buildRetailExecutionWorkbenchContext({
    activeNodeId: activeNode.id,
    activeNodeStep: activeNode.step,
    activeNodeTitle: activeNode.title,
    activeNodeAction: activeNode.executionAction,
    totalNodeCount: retailTrainingNodes.length,
    activeErrorCount: activeErrors.length,
    validationErrorCount: validationErrors.length,
    hasSettlement: Boolean(settlement),
    resultGenerated,
    saved,
    nextNodeTitle: nextNode?.title ?? null
  });

  function updateState(nextState: SetStateAction<RetailTrainingState>) {
    onTemplateMessage("");
    onStateChange(nextState);
  }

  function moveNextNode() {
    if (nextNode) setActiveNodeId(nextNode.id);
  }

  function exportJson() {
    downloadTextFile("adax_retailer_execution_template.json", createRetailExecutionTemplateJson(state), "application/json;charset=utf-8");
    onTemplateMessage("售电公司执行模板已导出。");
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    const parsed = parseRetailExecutionTemplate(await file.text());
    if (!parsed.ok || !parsed.data) {
      onTemplateMessage(`导入失败：${parsed.errors.join("；")}`);
      return;
    }
    onStateChange(parsed.data);
    onTemplateMessage(`售电公司执行模板已导入：${file.name}`);
  }

  return (
    <section className="retail-workbench">
      <RetailNodeRail
        activeNodeId={activeNode.id}
        badgeTone="green"
        badgeLabel="8 节点"
        onSelectNode={setActiveNodeId}
      />

      <main className="retail-operation-panel">
        <div className="retail-operation-head">
          <div>
            <p>节点 {activeNode.step}</p>
            <h2>{activeNode.title}</h2>
            <span className="retail-operation-mode">执行动作</span>
          </div>
          <RetailNodeAssist
            mode="execution"
            detail={activeNode.executionAction}
          />
        </div>

        <RetailExecutionContextBar context={workbenchContext} />

        <RetailExecutionNodeContent
          activeNodeId={activeNode.id}
          state={state}
          settlement={settlement}
          validationErrors={validationErrors}
          saved={saved}
          onChange={updateState}
        />

        <RetailExecutionNodeFooter
          errors={activeErrors}
          hasNextNode={Boolean(nextNode)}
          canEnterSettlement={Boolean(settlement && resultGenerated)}
          onReset={() => updateState(createEmptyRetailTrainingState())}
          onNextNode={moveNextNode}
          onEnterSettlement={onNext}
        />
      </main>

      <RetailExecutionResultPanel
        state={state}
        settlement={settlement}
        validationErrors={validationErrors}
        activeNodeErrors={activeErrors}
        annualServiceMwh={annualServiceMwh}
        resultGenerated={resultGenerated}
        onExportTemplate={exportJson}
        onImportTemplate={importJson}
        onGenerateResult={onGenerateResult}
        onNext={onNext}
      />
    </section>
  );
}
