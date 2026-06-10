import { AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "../Badge";
import { MetricCard } from "../MetricCard";
import { StepIndicator } from "../StepIndicator";
import { ModelBoundaryNotice } from "../adax/ModelBoundaryNotice";
import { RetailSettlementSignalBoard } from "./RetailSettlementSignalBoard";
import { buildRetailExecutionResultDisplay } from "../../domain/retailResultDisplay";
import { retailTypicalMonths } from "../../domain/retailState";
import type { RetailSettlementResult } from "../../domain/retailTypes";
import { formatCurrency, formatEnergy, formatNumber, formatPercent } from "../../utils/formatters";
import { retailRiskLabel, retailRiskTone, retailTypicalMonthShortLabels } from "../../utils/retailDisplay";

interface RetailSettlementPageProps {
  result: RetailSettlementResult | null;
  validationErrors: string[];
  onBack: () => void;
  onNext: () => void;
}

export function RetailSettlementPage({ result, validationErrors, onBack, onNext }: RetailSettlementPageProps) {
  if (!result) {
    return (
      <div className="page-shell cockpit-page">
        <StepIndicator current="settlement" mode="execution" />
        <section className="retail-output-empty">
          <AlertTriangle size={24} />
          <h1>暂不能生成结算结果</h1>
          <p>{validationErrors[0] ?? "请先返回交易工作台完成交易动作。"}</p>
          <button className="cockpit-primary-action" data-action="back-to-workspace" onClick={onBack}>
            返回交易工作台
          </button>
        </section>
      </div>
    );
  }

  const display = buildRetailExecutionResultDisplay(result);

  return (
    <div className="page-shell cockpit-page">
      <StepIndicator current="settlement" mode="execution" />
      <section className="cockpit-topbar mb-5">
        <div className="min-w-0">
          <p className="cockpit-kicker">RETAIL SETTLEMENT</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-100">售电公司模拟结算</h1>
          <div className="execution-workbench-steps" aria-label="结算结果看板结构">
            {["收入", "采购", "敞口", "修正", "诊断"].map((item, index) => (
              <span key={item}>{String(index + 1).padStart(2, "0")} {item}</span>
            ))}
          </div>
        </div>
        <div className="cockpit-summary-grid">
          <MetricCard label="年度服务电量" value={formatEnergy(result.annualServiceMwh)} detail="客户签约汇总" tone="blue" />
          <MetricCard label="零售收入" value={formatCurrency(result.retailRevenue)} detail="套餐收入" tone="green" />
          <MetricCard label="采购总成本" value={formatCurrency(result.costs.totalProcurementCost)} detail="合约 + 现货 + 风险修正" tone="orange" />
          <MetricCard label="经营毛利" value={formatCurrency(result.margin.grossMargin)} detail={`毛利率 ${formatPercent(result.margin.grossMarginRate)}`} tone={result.margin.grossMargin >= 0 ? "green" : "red"} />
        </div>
      </section>

      <section className="retail-output-grid">
        <main className="cockpit-panel">
          <RetailSettlementSignalBoard settlement={result} />

          <div className="retail-settlement-breakdown">
            <div className="retail-panel-heading">
              <span>月度集中竞价</span>
              <Badge tone="green">{formatEnergy(result.monthlyAuction.totalVolumeMwh)}</Badge>
            </div>
            {retailTypicalMonths.map((month) => {
              const item = result.monthlyAuction.byMonth[month];
              return (
                <div key={month} className="retail-month-result-row compact">
                  <span>{retailTypicalMonthShortLabels[month]}</span>
                  <strong>{item.participates ? "参与" : "不参与"}</strong>
                  <em>{item.participates ? `${formatEnergy(item.volumeMwh)} · ${formatNumber(item.bidPrice ?? 0)} 元/MWh` : "无月度补仓"}</em>
                </div>
              );
            })}
          </div>
        </main>

        <aside className="cockpit-panel">
          <div className="retail-panel-heading">
            <span>结果解读</span>
            <Badge tone={retailRiskTone(result.exposure.riskLevel)}>{retailRiskLabel(result.exposure.riskLevel)}</Badge>
          </div>
          <div className="retail-review-list">
            {display.insights.map((item, index) => (
              <div key={item.id} className="retail-review-row">
                <span>{index + 1}</span>
                <p><strong>{item.label} · {item.title}：</strong>{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="retail-side-facts">
            <div>
              <span>高价正敞口</span>
              <strong>{formatEnergy(result.exposure.highPricePositiveExposureMwh)}</strong>
            </div>
            <div>
              <span>低价负敞口</span>
              <strong>{formatEnergy(result.exposure.lowPriceNegativeExposureMwh)}</strong>
            </div>
            <div>
              <span>曲线匹配度</span>
              <strong>{formatNumber(result.exposure.curveMatchScore, 1)} 分</strong>
            </div>
          </div>
          <div className="retail-output-boundary">
            <ModelBoundaryNotice />
          </div>
          <button className="cockpit-primary-action" data-action="enter-result-review" onClick={onNext}>
            进入交易结果回看
            <ArrowRight size={15} />
          </button>
          <button className="cockpit-secondary-action mt-2" data-action="back-to-workspace" onClick={onBack}>
            <ArrowLeft size={15} />
            返回工作台
          </button>
        </aside>
      </section>
    </div>
  );
}
