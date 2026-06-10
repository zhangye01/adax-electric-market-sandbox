import { AlertTriangle, CheckCircle2, Download, Upload } from "lucide-react";
import { Badge } from "../Badge";
import { ModelBoundaryNotice } from "../adax/ModelBoundaryNotice";
import { retailTypicalMonths } from "../../domain/retailState";
import { checkAnnualBilateralDeal } from "../../domain/retailCalculations";
import { buildRetailExecutionResultDisplay } from "../../domain/retailResultDisplay";
import type { RetailSettlementResult, RetailTrainingState } from "../../domain/retailTypes";
import { formatCurrency, formatEnergy } from "../../utils/formatters";
import { retailRiskLabel } from "../../utils/retailDisplay";

interface RetailExecutionResultPanelProps {
  state: RetailTrainingState;
  settlement: RetailSettlementResult | null;
  validationErrors: string[];
  activeNodeErrors: string[];
  annualServiceMwh: number;
  resultGenerated: boolean;
  onExportTemplate: () => void;
  onImportTemplate: (file: File | undefined) => Promise<void>;
  onGenerateResult: () => void;
  onNext: () => void;
}

export function RetailExecutionResultPanel({
  state,
  settlement,
  validationErrors,
  activeNodeErrors,
  annualServiceMwh,
  resultGenerated,
  onExportTemplate,
  onImportTemplate,
  onGenerateResult,
  onNext
}: RetailExecutionResultPanelProps) {
  const hasBlockingErrors = validationErrors.length > 0;
  const activeNodeError = activeNodeErrors[0] ?? null;
  const resultBadge = resultGenerated ? "已生成" : settlement ? "可生成" : "待完成";

  return (
    <aside className="retail-result-panel">
      <div className="retail-panel-heading">
        <span>操作结果</span>
        <Badge tone={settlement ? "green" : "slate"}>{resultBadge}</Badge>
      </div>

      <button
        type="button"
        data-action="generate-retail-result"
        className="cockpit-primary-action"
        disabled={!settlement}
        onClick={onGenerateResult}
      >
        生成模拟结果
      </button>

      {!settlement ? (
        <div className="retail-empty-result">
          <AlertTriangle size={18} />
          <strong>{activeNodeError ? "当前节点未完成" : "等待生成模拟结果"}</strong>
          <p>
            {activeNodeError ??
              (hasBlockingErrors ? "按左侧节点顺序完成交易动作，全部节点通过后可生成模拟结果。" : "当前交易动作已满足生成条件。")}
          </p>
        </div>
      ) : resultGenerated ? (
        <>
          <ResultSnapshot settlement={settlement} />
          <div className="retail-output-boundary">
            <ModelBoundaryNotice compact />
          </div>
        </>
      ) : (
        <div className="retail-empty-result ready">
          <CheckCircle2 size={18} />
          <strong>可以生成模拟结果</strong>
          <p>点击上方按钮后查看收入、成本、现货敞口和风险等级。</p>
        </div>
      )}

      <div className="retail-side-facts">
        <div>
          <span>年度服务电量</span>
          <strong>{annualServiceMwh > 0 ? formatEnergy(annualServiceMwh) : "待填写"}</strong>
        </div>
        <div>
          <span>年度双边反馈</span>
          <strong>{annualDealLabel(state)}</strong>
        </div>
        <div>
          <span>月度竞价选择</span>
          <strong>{retailTypicalMonths.filter((month) => state.monthlyAuctions[month].participates !== null).length}/3</strong>
        </div>
      </div>

      <details className="retail-side-action-drawer">
        <summary>模板导入 / 导出</summary>
        <div className="retail-side-action-stack">
          <label className="cockpit-secondary-action retail-file-action" data-action="import-execution-template">
            <Upload size={15} />
            导入模板
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (event) => {
                await onImportTemplate(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>

          <button type="button" data-action="export-execution-template" className="cockpit-secondary-action" onClick={onExportTemplate}>
            <Download size={15} />
            导出模板
          </button>
        </div>
      </details>

      <button type="button" data-action="view-retail-settlement" className="cockpit-secondary-action" disabled={!settlement || !resultGenerated} onClick={onNext}>
        查看结算详情
      </button>
    </aside>
  );
}

function ResultSnapshot({ settlement }: { settlement: RetailSettlementResult }) {
  const display = buildRetailExecutionResultDisplay(settlement);

  return (
    <div className="retail-result-snapshot">
      <div>
        <span>经营毛利</span>
        <strong>{formatCurrency(settlement.margin.grossMargin)}</strong>
      </div>
      <div>
        <span>风险等级</span>
        <strong>{retailRiskLabel(settlement.exposure.riskLevel)}</strong>
      </div>
      <div>
        <span>风险修正金额</span>
        <strong>{formatCurrency(settlement.costs.curveMismatchRiskAdjustment)}</strong>
      </div>
      <p>{display.verdict.detail}</p>
    </div>
  );
}

function annualDealLabel(state: RetailTrainingState) {
  if (state.annualBilateral.bidPrice === null) return "待报价";
  return checkAnnualBilateralDeal(state).accepted ? "已接受" : "未接受";
}
