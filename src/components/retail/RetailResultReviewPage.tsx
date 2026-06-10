import { ArrowLeft, CheckCircle2, Save, ShieldCheck } from "lucide-react";
import { Badge } from "../Badge";
import { StepIndicator } from "../StepIndicator";
import { ModelBoundaryNotice } from "../adax/ModelBoundaryNotice";
import { ModeBoundaryNotice } from "../adax/ModeBoundaryNotice";
import { RetailSettlementSignalBoard } from "./RetailSettlementSignalBoard";
import { getAdaxModeBoundary } from "../../domain/adaxModeBoundary";
import { buildRetailExecutionResultDisplay } from "../../domain/retailResultDisplay";
import type { RetailSettlementResult } from "../../domain/retailTypes";

interface RetailResultReviewPageProps {
  result: RetailSettlementResult | null;
  saved: boolean;
  onSave: () => void;
  onRetry: () => void;
  onRecords: () => void;
  onHome: () => void;
}

export function RetailResultReviewPage({
  result,
  saved,
  onSave,
  onRetry,
  onRecords,
  onHome
}: RetailResultReviewPageProps) {
  if (!result) {
    return (
      <div className="page-shell cockpit-page">
        <StepIndicator current="review" mode="execution" />
        <section className="retail-output-empty">
          <ShieldCheck size={24} />
          <h1>尚未形成交易结果</h1>
          <p>请先返回交易工作台完成售电公司模拟交易动作。</p>
          <button className="cockpit-primary-action" data-action="retry-workspace" onClick={onRetry}>
            返回交易工作台
          </button>
        </section>
      </div>
    );
  }

  const modeBoundary = getAdaxModeBoundary("executionResultReview");
  const display = buildRetailExecutionResultDisplay(result);

  return (
    <div className="page-shell cockpit-page">
      <StepIndicator current="review" mode="execution" />
      <section className="cockpit-topbar mb-5">
        <div className="min-w-0">
          <p className="cockpit-kicker">RESULT REVIEW</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-100">售电公司交易结果回看</h1>
          <div className="execution-workbench-steps" aria-label="交易结果回看结构">
            {["结算信号", "敞口结构", "诊断重点", "保存记录"].map((item, index) => (
              <span key={item}>{String(index + 1).padStart(2, "0")} {item}</span>
            ))}
          </div>
        </div>
        <div className="retail-result-review-status" aria-label="结果回看状态">
          <div>
            <span>结果口径</span>
            <strong>{modeBoundary.primaryOutput}</strong>
          </div>
          <div>
            <span>保存状态</span>
            <strong>{saved ? "已保存" : "待保存"}</strong>
          </div>
        </div>
      </section>

      <section className="retail-output-grid result-review">
        <main className="cockpit-panel retail-result-review-main">
          <div className="retail-panel-heading">
            <span>交易结果信号</span>
            <Badge tone="blue">{modeBoundary.label}</Badge>
          </div>
          <RetailSettlementSignalBoard settlement={result} />
        </main>

        <aside className="cockpit-panel retail-result-review-side">
          <div className="retail-panel-heading">
            <span>诊断与保存</span>
            <Badge tone={saved ? "green" : "orange"}>{saved ? "已保存" : "待保存"}</Badge>
          </div>

          <div className={`retail-result-verdict-compact tone-${display.verdict.severity}`}>
            <span>回看结论</span>
            <strong>{display.verdict.title}</strong>
            <p>{display.verdict.detail}</p>
          </div>

          <div className="retail-review-list">
            {display.insights.map((item, index) => (
              <div key={item.id} className={`retail-review-row tone-${item.severity}`}>
                <span>{index + 1}</span>
                <p><strong>{item.label} · {item.title}：</strong>{item.detail}</p>
              </div>
            ))}
          </div>

          <details className="retail-side-action-drawer retail-diagnostics-drawer">
            <summary>系统诊断明细</summary>
            <div className="retail-diagnostics-list">
              {result.diagnostics.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </details>

          <div className="retail-output-boundary">
            <ModeBoundaryNotice surface="executionResultReview" />
          </div>
          <div className="retail-output-boundary compact">
            <ModelBoundaryNotice />
          </div>
          <button className="cockpit-primary-action" data-action="save-training-record" disabled={saved} onClick={onSave}>
            {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
            {saved ? "已保存训练记录" : "保存训练记录"}
          </button>
          <button className="cockpit-secondary-action mt-2" data-action="view-records" onClick={onRecords}>
            查看训练记录
          </button>
          <button className="cockpit-secondary-action mt-2" data-action="retry-workspace" onClick={onRetry}>
            <ArrowLeft size={15} />
            返回工作台
          </button>
          <button className="cockpit-secondary-action mt-2" data-action="go-home" onClick={onHome}>
            返回首页
          </button>
        </aside>
      </section>
    </div>
  );
}
