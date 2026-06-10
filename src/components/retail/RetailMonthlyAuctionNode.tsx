import type { SetStateAction } from "react";
import { buildRetailMonthlyAuctionDisplay } from "../../domain/retailMonthlyAuctionDisplay";
import type { RetailTrainingState, RetailTypicalMonth } from "../../domain/retailTypes";
import { NullableNumberInput } from "./RetailExecutionControls";

export function MonthlyAuctionNode({ state, onChange }: { state: RetailTrainingState; onChange: (state: SetStateAction<RetailTrainingState>) => void }) {
  const display = buildRetailMonthlyAuctionDisplay(state);
  const [minPrice, maxPrice] = display.priceBounds;

  function updateMonth(month: RetailTypicalMonth, patch: Partial<RetailTrainingState["monthlyAuctions"][RetailTypicalMonth]>) {
    onChange((current) => ({
      ...current,
      monthlyAuctions: {
        ...current.monthlyAuctions,
        [month]: {
          ...current.monthlyAuctions[month],
          ...patch
        }
      }
    }));
  }

  return (
    <div className="retail-node-content">
      <div className="retail-trade-node-workbench monthly-auction">
        <section className="retail-primary-action-panel" aria-label="月度集中竞价主操作">
          <div className="retail-node-section-head">
            <div>
              <span>主操作</span>
              <strong>逐月选择是否参与集中竞价</strong>
            </div>
            <em>{display.selectedWindowCount}/{display.totalWindowCount} 个窗口已选择</em>
          </div>

          <div className="retail-month-decision-list">
            {display.windows.map((data) => {
              const month = data.id;
              const decision = state.monthlyAuctions[month];
              return (
                <article key={month} className="retail-month-decision-card">
                  <header>
                    <div>
                      <span>{data.label}</span>
                      <strong>{data.name}</strong>
                    </div>
                    <div className="retail-month-status">
                      <em className={data.decisionTone === "pending" ? "pending" : data.decisionTone === "participating" ? "done" : "skipped"}>{data.decisionLabel}</em>
                      <small>参考 {data.referenceBidRange[0]}-{data.referenceBidRange[1]} 元/MWh</small>
                    </div>
                  </header>
                  <div className="retail-participation-toggle">
                    <button
                      type="button"
                      data-month={month}
                      data-decision="participate"
                      aria-pressed={decision.participates === true}
                      className={decision.participates === true ? "active" : ""}
                      onClick={() => updateMonth(month, { participates: true })}
                    >
                      参与
                    </button>
                    <button
                      type="button"
                      data-month={month}
                      data-decision="skip"
                      aria-pressed={decision.participates === false}
                      className={decision.participates === false ? "active" : ""}
                      onClick={() => updateMonth(month, { participates: false, coverageRatio: null, bidPrice: null, curveType: null })}
                    >
                      不参与
                    </button>
                  </div>
                  {decision.participates ? (
                    <div className="retail-month-input-grid">
                      <label>
                        <span className="retail-field-head">
                          <span>补仓比例 %</span>
                          <em className={decision.coverageRatio === null ? "pending" : "done"}>{decision.coverageRatio === null ? "待填写" : "已填"}</em>
                        </span>
                        <NullableNumberInput
                          value={decision.coverageRatio}
                          placeholder="0-50"
                          min={0}
                          max={50}
                          ariaLabel={`${data.name}补仓比例`}
                          onChange={(coverageRatio) => updateMonth(month, { coverageRatio })}
                        />
                      </label>
                      <label>
                        <span className="retail-field-head">
                          <span>申报价格</span>
                          <em className={decision.bidPrice === null ? "pending" : "done"}>{decision.bidPrice === null ? "待填写" : "已填"}</em>
                        </span>
                        <NullableNumberInput
                          value={decision.bidPrice}
                          placeholder={`${minPrice}-${maxPrice}`}
                          min={minPrice}
                          max={maxPrice}
                          ariaLabel={`${data.name}申报价格`}
                          onChange={(bidPrice) => updateMonth(month, { bidPrice })}
                        />
                      </label>
                      <div className="retail-segment-block">
                        <span className="retail-field-head">
                          <span>月度曲线</span>
                          <em className={decision.curveType === null ? "pending" : "done"}>{decision.curveType === null ? "未选择" : "已选择"}</em>
                        </span>
                        <div className="retail-segmented">
                          <button
                            type="button"
                            data-month={month}
                            data-curve="flat"
                            aria-pressed={decision.curveType === "flat"}
                            className={decision.curveType === "flat" ? "active" : ""}
                            onClick={() => updateMonth(month, { curveType: "flat" })}
                          >
                            直线
                          </button>
                          <button
                            type="button"
                            data-month={month}
                            data-curve="typicalMonth"
                            aria-pressed={decision.curveType === "typicalMonth"}
                            className={decision.curveType === "typicalMonth" ? "active" : ""}
                            onClick={() => updateMonth(month, { curveType: "typicalMonth" })}
                          >
                            典型月曲线
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="retail-reference-feedback-panel" aria-label="月度集中竞价参考与反馈">
          <div className="retail-node-section-head compact">
            <div>
              <span>交易窗口</span>
              <strong>三个月度典型窗口</strong>
            </div>
          </div>
          <div className="retail-reference-facts">
            <div>
              <span>已选择窗口</span>
              <strong>{display.selectedWindowCount}/{display.totalWindowCount}</strong>
            </div>
            <div>
              <span>参与窗口</span>
              <strong>{display.participatingWindowCount} 个</strong>
            </div>
            <div>
              <span>申报价格范围</span>
              <strong>{minPrice}-{maxPrice} 元/MWh</strong>
            </div>
          </div>
          <div className="retail-month-window-reference-list">
            {display.windows.map((window) => (
              <div key={window.id}>
                <span>{window.label}</span>
                <strong>{window.referenceBidRange[0]}-{window.referenceBidRange[1]} 元/MWh</strong>
                <p>{window.feature}</p>
              </div>
            ))}
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
