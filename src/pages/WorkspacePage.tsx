import type { Dispatch, SetStateAction } from "react";
import { StepIndicator } from "../components/StepIndicator";
import { TemplateMessageNotice } from "../components/adax/TemplateMessageNotice";
import { RetailExecutionWorkspace } from "../components/retail/RetailExecutionWorkspace";
import { RetailReviewWorkspace } from "../components/retail/RetailReviewWorkspace";
import { adaxScenarioMeta } from "../data/adaxScenarioMeta";
import { retailTrainingNodes } from "../data/retailTrainingNodes";
import { getRetailReviewMaterialStats } from "../domain/retailReviewMaterials";
import type { RetailSettlementResult, RetailTrainingState } from "../domain/retailTypes";
import type { AdaxTrainingMode, UserMaterial } from "../types";

interface WorkspacePageProps {
  mode: AdaxTrainingMode;
  retailTrainingState: RetailTrainingState;
  retailSettlement: RetailSettlementResult | null;
  retailValidationErrors: string[];
  executionResultGenerated: boolean;
  templateMessage: string;
  onTemplateMessage: (message: string) => void;
  onRetailTrainingStateChange: Dispatch<SetStateAction<RetailTrainingState>>;
  onGenerateExecutionResult: () => void;
  materials: UserMaterial[];
  saved: boolean;
  onMaterialChange: (node: { id: string; title: string }, materialType: UserMaterial["materialType"], content: string) => void;
  onSaveReviewRecord: () => void;
  onRecords: () => void;
  onHome: () => void;
  onNext: () => void;
}

export function WorkspacePage({
  mode,
  retailTrainingState,
  retailSettlement,
  retailValidationErrors,
  executionResultGenerated,
  templateMessage,
  onTemplateMessage,
  onRetailTrainingStateChange,
  onGenerateExecutionResult,
  materials,
  saved,
  onMaterialChange,
  onSaveReviewRecord,
  onRecords,
  onHome,
  onNext
}: WorkspacePageProps) {
  const workspaceSteps = ["行情", "客户", "套餐", "年度", "月度", "敞口", "结算", "回看"];

  if (mode === "execution") {
    return (
      <div className="page-shell cockpit-page">
        <div className="mb-5">
          <StepIndicator current="strategy" mode={mode} />
        </div>

        <WorkspaceCommandBar
          kicker="RETAIL EXECUTION"
          title="售电公司交易工作台"
          steps={workspaceSteps}
          facts={[
            ["场景", "虚拟省级市场 A"],
            ["主体", "售电公司"],
            ["节点", `${retailTrainingNodes.length} 个`],
            ["结果", executionResultGenerated ? "已生成" : retailSettlement ? "可生成" : "待完成"]
          ]}
        />

        <RetailExecutionWorkspace
          state={retailTrainingState}
          settlement={retailSettlement}
          validationErrors={retailValidationErrors}
          resultGenerated={executionResultGenerated}
          saved={saved}
          onStateChange={onRetailTrainingStateChange}
          onTemplateMessage={onTemplateMessage}
          onGenerateResult={onGenerateExecutionResult}
          onNext={onNext}
        />
        <TemplateMessageNotice message={templateMessage} />
      </div>
    );
  }

  const reviewStats = getRetailReviewMaterialStats(materials, {
    scenarioId: adaxScenarioMeta.id,
    participantType: "retailer"
  });

  return (
    <div className="page-shell cockpit-page">
      <div className="mb-5">
        <StepIndicator current="strategy" mode={mode} />
      </div>

      <WorkspaceCommandBar
        kicker="RETAIL REVIEW"
        title="售电公司复盘工作台"
        steps={workspaceSteps}
        facts={[
          ["场景", "虚拟省级市场 A"],
          ["主体", "售电公司"],
          ["节点", `${retailTrainingNodes.length} 个`],
          ["材料", `${reviewStats.materialCount} 条 / ${reviewStats.coveredNodeCount} 节点`]
        ]}
      />

      <RetailReviewWorkspace
        scenarioId={adaxScenarioMeta.id}
        materials={materials}
        saved={saved}
        onMaterialChange={onMaterialChange}
        onTemplateMessage={onTemplateMessage}
        onSave={onSaveReviewRecord}
        onRecords={onRecords}
        onHome={onHome}
      />
      <TemplateMessageNotice message={templateMessage} />
    </div>
  );
}

function WorkspaceCommandBar({
  kicker,
  title,
  steps,
  facts
}: {
  kicker: string;
  title: string;
  steps: string[];
  facts: Array<[string, string]>;
}) {
  return (
    <section className="workspace-command-bar">
      <div className="min-w-0">
        <p className="cockpit-kicker">{kicker}</p>
        <h1>{title}</h1>
        <div className="execution-workbench-steps compact" aria-label={`${title}操作链路`}>
          {steps.map((item, index) => (
            <span key={item}>{String(index + 1).padStart(2, "0")} {item}</span>
          ))}
        </div>
      </div>
      <div className="workspace-fact-strip">
        {facts.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
