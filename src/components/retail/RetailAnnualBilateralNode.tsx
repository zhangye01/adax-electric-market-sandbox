import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import type { SetStateAction } from "react";
import { buildRetailAnnualBilateralDisplay } from "../../domain/retailAnnualBilateralDisplay";
import type { RetailTrainingState } from "../../domain/retailTypes";
import { NullableNumberInput, SegmentedChoice } from "./RetailExecutionControls";

export function AnnualBilateralNode({ state, onChange }: { state: RetailTrainingState; onChange: (state: SetStateAction<RetailTrainingState>) => void }) {
  const display = buildRetailAnnualBilateralDisplay(state);
  const [minPrice, maxPrice] = display.priceBounds;
  const dealIcon =
    display.dealTone === "accepted" ? <CheckCircle2 size={18} /> : display.dealTone === "blocked" ? <AlertTriangle size={18} /> : <HelpCircle size={18} />;

  return (
    <div className="retail-node-content">
      <div className="retail-trade-node-workbench annual-bilateral">
        <section className="retail-primary-action-panel" aria-label="年度双边主操作">
          <div className="retail-node-section-head">
            <div>
              <span>主操作</span>
              <strong>形成年度双边采购协议</strong>
            </div>
            <em>{display.completedFieldCount}/{display.totalFieldCount} 项已完成</em>
          </div>

          <div className="retail-form-grid two retail-primary-inputs">
            <label className="retail-input-card">
              <span className="retail-field-head">
                <span>年度覆盖比例</span>
                <em className={state.annualBilateral.coverageRatio === null ? "pending" : "done"}>
                  {state.annualBilateral.coverageRatio === null ? "待填写" : "已填"}
                </em>
              </span>
              <NullableNumberInput
                value={state.annualBilateral.coverageRatio}
                placeholder="80-120"
                min={80}
                max={120}
                ariaLabel="年度覆盖比例"
                onChange={(coverageRatio) => onChange((current) => ({ ...current, annualBilateral: { ...current.annualBilateral, coverageRatio } }))}
              />
              <em>单位 %</em>
            </label>
            <label className="retail-input-card">
              <span className="retail-field-head">
                <span>年度双边报价</span>
                <em className={state.annualBilateral.bidPrice === null ? "pending" : display.dealTone === "accepted" ? "done" : "warning"}>
                  {state.annualBilateral.bidPrice === null ? "待报价" : display.dealTone === "accepted" ? "可成交" : "未成交"}
                </em>
              </span>
              <NullableNumberInput
                value={state.annualBilateral.bidPrice}
                placeholder={`${minPrice}-${maxPrice}`}
                min={minPrice}
                max={maxPrice}
                ariaLabel="年度双边报价"
                onChange={(bidPrice) => onChange((current) => ({ ...current, annualBilateral: { ...current.annualBilateral, bidPrice } }))}
              />
              <em>单位 元/MWh</em>
            </label>
          </div>

          <SegmentedChoice
            label="年度合约曲线"
            value={state.annualBilateral.curveType}
            options={[
              ["flat", "直线"],
              ["industrial", "大工业用户曲线"]
            ]}
            onChange={(curveType) => onChange((current) => ({ ...current, annualBilateral: { ...current.annualBilateral, curveType } }))}
          />
        </section>

        <aside className="retail-reference-feedback-panel" aria-label="年度双边参考与反馈">
          <div className="retail-node-section-head compact">
            <div>
              <span>市场参考</span>
              <strong>本年度双边边界</strong>
            </div>
          </div>
          <div className="retail-reference-facts">
            <div>
              <span>报价参考</span>
              <strong>{display.referenceRange[0]}-{display.referenceRange[1]} 元/MWh</strong>
            </div>
            <div>
              <span>对手方底价</span>
              <strong>{display.counterpartyFloorPrice} 元/MWh</strong>
            </div>
            <div>
              <span>覆盖比例范围</span>
              <strong>{display.coverageRangeLabel}</strong>
            </div>
          </div>
          <div className={`retail-deal-feedback ${display.dealTone}`}>
            {dealIcon}
            <strong>{display.dealMessage}</strong>
          </div>
          <div className="retail-next-action-strip">
            <span>当前状态</span>
            <strong>{display.statusLabel}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
