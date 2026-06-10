import type { SetStateAction } from "react";
import { buildRetailCustomerLoadDisplay } from "../../domain/retailCustomerLoadDisplay";
import type { RetailTrainingState } from "../../domain/retailTypes";
import { formatEnergy, formatPercent } from "../../utils/formatters";
import { NullableNumberInput } from "./RetailExecutionControls";

interface CustomerLoadNodeProps {
  state: RetailTrainingState;
  onChange: (state: SetStateAction<RetailTrainingState>) => void;
}

export function CustomerLoadNode({
  state,
  onChange
}: CustomerLoadNodeProps) {
  const display = buildRetailCustomerLoadDisplay(state);

  return (
    <div className="retail-node-content">
      <div className="retail-trade-node-workbench customer-load">
        <section className="retail-primary-action-panel" aria-label="客户负荷主操作">
          <div className="retail-node-section-head">
            <div>
              <span>主操作</span>
              <strong>录入客户签约电量</strong>
            </div>
            <em>{display.filledSegmentCount}/{display.totalSegmentCount} 类已填写</em>
          </div>

          <div className="retail-form-grid">
            {display.segments.map((segment) => (
              <label key={segment.id} className="retail-input-card">
                <span className="retail-field-head">
                  <span>{segment.label}</span>
                  <em className={segment.completed ? "done" : "pending"}>{segment.completed ? "已填" : "待填写"}</em>
                </span>
                <NullableNumberInput
                  value={segment.value}
                  placeholder={`0-${segment.maxContractMwh}`}
                  min={0}
                  max={segment.maxContractMwh}
                  ariaLabel={`${segment.label}签约电量`}
                  onChange={(value) =>
                    onChange((current) => ({
                      ...current,
                      customerContracts: {
                        ...current.customerContracts,
                        [segment.contractKey]: value
                      }
                    }))
                  }
                />
                <em>上限 {formatEnergy(segment.maxContractMwh)} · {segment.sizeTag}</em>
              </label>
            ))}
          </div>
        </section>

        <aside className="retail-reference-feedback-panel" aria-label="客户负荷参考与反馈">
          <div className="retail-node-section-head compact">
            <div>
              <span>负荷结构</span>
              <strong>客户组合反馈</strong>
            </div>
          </div>
          <div className="retail-reference-facts">
            <div>
              <span>年度服务电量</span>
              <strong>{display.annualServiceMwh > 0 ? formatEnergy(display.annualServiceMwh) : "待填写"}</strong>
            </div>
            <div>
              <span>可签约上限</span>
              <strong>{formatEnergy(display.totalAvailableMwh)}</strong>
            </div>
            <div>
              <span>已填写客户</span>
              <strong>{display.filledSegmentCount}/{display.totalSegmentCount}</strong>
            </div>
          </div>
          <div className="retail-mix-reference-list">
            {display.mixRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{formatPercent(row.value, 1)}</strong>
              </div>
            ))}
          </div>
          <div className="retail-segment-risk-list">
            {display.segments.map((segment) => (
              <div key={segment.id}>
                <span>{segment.label}</span>
                <p>{segment.riskTag}</p>
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
