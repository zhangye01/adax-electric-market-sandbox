import type { SetStateAction } from "react";
import { buildRetailPackageDisplay } from "../../domain/retailPackageDisplay";
import type { RetailTrainingState } from "../../domain/retailTypes";

export function RetailPackageNode({ state, onChange }: { state: RetailTrainingState; onChange: (state: SetStateAction<RetailTrainingState>) => void }) {
  const display = buildRetailPackageDisplay(state);

  return (
    <div className="retail-node-content">
      <div className="retail-trade-node-workbench package-selection">
        <section className="retail-primary-action-panel" aria-label="零售套餐主操作">
          <div className="retail-node-section-head">
            <div>
              <span>主操作</span>
              <strong>选择客户零售套餐</strong>
            </div>
            <em>{display.selectedCount}/{display.requiredCount} 项已选择</em>
          </div>

          <div className="retail-choice-grid">
            {display.options.map((option) => (
              <button
                key={option.id}
                type="button"
                data-package={option.id}
                title={option.description}
                aria-pressed={option.active}
                className={`retail-choice-card ${option.active ? "active" : ""}`}
                onClick={() => onChange((current) => ({ ...current, retailPackage: { packageType: option.id } }))}
              >
                <span className="retail-choice-card-label">
                  {option.label}
                  <em>{option.active ? "已选择" : "可选"}</em>
                </span>
                <strong>{option.priceText}</strong>
                <p>{option.description}</p>
              </button>
            ))}
          </div>
        </section>

        <aside className="retail-reference-feedback-panel" aria-label="零售套餐参考与反馈">
          <div className="retail-node-section-head compact">
            <div>
              <span>收入模型</span>
              <strong>套餐选择反馈</strong>
            </div>
          </div>
          <div className="retail-reference-facts">
            <div>
              <span>已选套餐</span>
              <strong>{display.selectedPackageLabel}</strong>
            </div>
            <div>
              <span>套餐数量</span>
              <strong>{display.options.length} 种</strong>
            </div>
            <div>
              <span>选择进度</span>
              <strong>{display.selectedCount}/{display.requiredCount}</strong>
            </div>
          </div>
          <div className="retail-selected-package-note">
            <span>{display.selectedPackage ? "当前套餐说明" : "操作提示"}</span>
            <p>{display.selectedPackageDescription}</p>
          </div>
          <div className="retail-package-reference-list">
            {display.options.map((option) => (
              <div key={option.id}>
                <span>{option.label}</span>
                <strong>{option.priceText}</strong>
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
