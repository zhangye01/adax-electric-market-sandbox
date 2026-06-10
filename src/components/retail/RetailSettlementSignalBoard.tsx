import { Badge } from "../Badge";
import { buildRetailSettlementDisplay } from "../../domain/retailSettlementDisplay";
import type { RetailSettlementResult } from "../../domain/retailTypes";
import { formatCurrency, formatEnergy, formatNumber } from "../../utils/formatters";
import { retailRiskLabel } from "../../utils/retailDisplay";

interface RetailSettlementSignalBoardProps {
  settlement: RetailSettlementResult;
  variant?: "settlement" | "exposure";
}

export function RetailSettlementSignalBoard({ settlement, variant = "settlement" }: RetailSettlementSignalBoardProps) {
  const display = buildRetailSettlementDisplay(settlement);

  return (
    <section className={`retail-settlement-board ${variant}`} aria-label="售电公司模拟结果信号看板">
      <header className={`retail-settlement-board-head tone-${display.headline.tone}`}>
        <div>
          <span>RESULT SIGNAL</span>
          <h2>{display.headline.title}</h2>
          <p>{display.headline.detail}</p>
        </div>
        <div className="retail-settlement-risk-chip">
          <span>风险等级</span>
          <strong>{retailRiskLabel(display.exposure.riskLevel)}</strong>
          <em>{formatNumber(display.exposure.curveMatchScore, 1)} 分匹配</em>
        </div>
      </header>

      {variant === "settlement" ? (
        <div className="retail-settlement-signal-grid">
          {display.signals.map((signal) => (
            <div key={signal.id} className={`retail-settlement-signal tone-${signal.tone}`}>
              <span>{signal.label}</span>
              <strong>{signal.id === "riskLevel" ? retailRiskLabel(signal.value as RetailSettlementResult["exposure"]["riskLevel"]) : formatCurrency(signal.value as number)}</strong>
              <p>{signal.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="retail-settlement-board-grid">
        <div className="retail-exposure-map">
          <div className="retail-settlement-section-title">
            <div>
              <span>SPOT EXPOSURE</span>
              <strong>{display.exposure.title}</strong>
            </div>
            <Badge tone={display.exposure.riskLevel === "high" ? "red" : display.exposure.riskLevel === "medium" ? "orange" : "green"}>
              {retailRiskLabel(display.exposure.riskLevel)}
            </Badge>
          </div>
          <p>{display.exposure.detail}</p>
          <div className="retail-exposure-signal-list">
            {display.exposure.signals.map((signal) => (
              <div key={signal.id} className={`retail-exposure-signal tone-${signal.tone}`}>
                <div>
                  <span>{signal.label}</span>
                  <strong>{formatEnergy(signal.valueMwh)}</strong>
                </div>
                <em>
                  <i style={{ width: `${Math.max(4, signal.shareOfService * 100)}%` }} />
                </em>
                <small>{signal.detail}</small>
              </div>
            ))}
          </div>
        </div>

        {variant === "settlement" ? (
          <div className="retail-cost-stack-map">
            <div className="retail-settlement-section-title">
              <div>
                <span>COST STACK</span>
                <strong>{display.costStack.title}</strong>
              </div>
              <Badge tone="slate">训练级</Badge>
            </div>
            <p>{display.costStack.detail}</p>
            <div className="retail-cost-stack-list">
              {display.costStack.items.map((item) => (
                <div key={item.id} className={`retail-cost-stack-item tone-${item.tone}`}>
                  <div>
                    <span>{item.label}</span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                  <em>
                    <i style={{ width: `${Math.max(4, item.shareOfTotalCost * 100)}%` }} />
                  </em>
                  <small>{item.detail}</small>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
