import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { RetailExecutionNodeContent } from "./RetailExecutionNodeContent";
import { RetailExecutionResultPanel } from "./RetailExecutionResultPanel";
import { RetailNodeAssist } from "./RetailNodeAssist";
import { RetailNodeRail } from "./RetailNodeRail";
import { retailTrainingNodes } from "../../data/retailTrainingNodes";
import { calculateAnnualServiceMwh, calculateCustomerMix } from "../../domain/retailCalculations";
import { buildRetailExecutionWorkbenchContext, type RetailExecutionWorkbenchContext } from "../../domain/retailExecutionWorkbench";
import { createEmptyRetailTrainingState } from "../../domain/retailState";
import type {
  RetailNodeId,
  RetailSettlementResult,
  RetailTrainingState
} from "../../domain/retailTypes";
import {
  validateAnnualBilateral,
  validateCustomerContracts,
  validateMonthlyAuctions,
  validateRetailPackage
} from "../../domain/retailValidation";
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
  const activeErrors = validationErrorsForNode(activeNode.id, state, validationErrors);
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

        <div className="retail-node-footer">
          <ValidationBlock errors={activeErrors} />
          <div className="retail-node-actions">
            <button type="button" data-action="reset-retail-state" className="cockpit-secondary-action" onClick={() => updateState(createEmptyRetailTrainingState())}>
              <RotateCcw size={15} />
              重置
            </button>
            {nextNode ? (
              <button type="button" data-action="next-retail-node" className="cockpit-primary-action" onClick={moveNextNode}>
                下一节点
                <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" data-action="enter-settlement" className="cockpit-primary-action" disabled={!settlement || !resultGenerated} onClick={onNext}>
                进入结算结果
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
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

function RetailExecutionContextBar({ context }: { context: RetailExecutionWorkbenchContext }) {
  return (
    <div className="retail-execution-context-bar" aria-label="当前交易节点上下文">
      <div className="retail-execution-context-primary">
        <span>{context.nodePositionLabel}</span>
        <strong>{context.nodeTitle}</strong>
        <p>{context.actionLabel}</p>
      </div>
      <div>
        <span>业务阶段</span>
        <strong>{context.stageLabel}</strong>
      </div>
      <div>
        <span>输入 / 输出</span>
        <strong>{context.artifactLabel}</strong>
      </div>
      <div className={`status-${context.statusTone}`}>
        <span>节点状态</span>
        <strong>{context.statusLabel}</strong>
      </div>
      <div>
        <span>下一动作</span>
        <strong>{context.nextActionLabel}</strong>
      </div>
    </div>
  );
}

function ValidationBlock({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return (
      <div className="retail-validation ok">
        <CheckCircle2 size={16} />
        <span>当前节点校验通过</span>
      </div>
    );
  }
  return (
    <div className="retail-validation error">
      <AlertTriangle size={16} />
      <span>{errors[0]}</span>
    </div>
  );
}

function validationErrorsForNode(id: RetailNodeId, state: RetailTrainingState, allErrors: string[]) {
  if (id === "marketBrief") return [];
  if (id === "customerLoad") return validateCustomerContracts(state).errors;
  if (id === "retailPackage") return validateRetailPackage(state).errors;
  if (id === "annualBilateral") return validateAnnualBilateral(state).errors;
  if (id === "monthlyAuction") return validateMonthlyAuctions(state).errors;
  return allErrors;
}
