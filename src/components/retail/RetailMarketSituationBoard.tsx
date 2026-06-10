import type { RetailMarketContext, RetailTypicalDayMarketContext } from "../../domain/retailMarketContext";
import { formatEnergy, formatNumber } from "../../utils/formatters";

interface RetailMarketSituationBoardProps {
  context: RetailMarketContext;
  variant?: "scenario" | "compact";
}

export function RetailMarketSituationBoard({ context, variant = "scenario" }: RetailMarketSituationBoardProps) {
  const [priceMin, priceMax] = context.annual.priceBounds;

  return (
    <section className={`retail-market-board ${variant}`} aria-label="统一虚拟省级市场行情看板">
      <header className="retail-market-board-header">
        <div>
          <span>MARKET INPUT</span>
          <h2>年度供需与典型日价格</h2>
        </div>
        <div className="retail-market-price-boundary">
          <span>训练价格边界</span>
          <strong>{priceMin}-{priceMax}</strong>
          <em>元/MWh</em>
        </div>
      </header>

      <div className="retail-market-board-grid">
        <div className="retail-market-load-panel">
          <div className="retail-market-panel-title">
            <span>年度负荷边界</span>
            <strong>{formatEnergy(context.annual.referenceServiceMwh)}</strong>
          </div>
          <div className="retail-load-bars" aria-label="年度负荷范围">
            <LoadBar label="最大负荷" value={context.annual.maxLoadMw} max={context.annual.maxLoadMw} />
            <LoadBar label="最小负荷" value={context.annual.minLoadMw} max={context.annual.maxLoadMw} />
          </div>
          <div className="retail-load-spread">
            <span>峰谷差</span>
            <strong>{formatNumber(context.annual.peakValleySpreadMw)} MW</strong>
          </div>
          <div className="retail-market-floor">
            <span>年度双边对手方底价</span>
            <strong>{context.annual.counterpartyFloorPrice} 元/MWh</strong>
          </div>
        </div>

        <div className="retail-market-curve-panel">
          <div className="retail-market-panel-title">
            <span>24 小时现货价格带</span>
            <strong>{context.summary.widestSpreadTypicalDay.name}</strong>
          </div>
          <div className="retail-price-curve-stack">
            {context.typicalDays.map((day) => (
              <PriceCurveRow key={day.id} day={day} priceMin={priceMin} priceMax={priceMax} />
            ))}
          </div>
        </div>

        <div className="retail-market-month-panel">
          <div className="retail-market-panel-title">
            <span>月度交易窗口</span>
            <strong>{context.summary.highestAveragePriceMonth.label} 价格最高</strong>
          </div>
          <div className="retail-market-month-list">
            {context.monthlyWindows.map((month) => (
              <div key={month.id} className="retail-market-month-item">
                <div>
                  <span>{month.label}</span>
                  <strong>{month.averageSpotPrice} 元/MWh</strong>
                </div>
                <p>{month.referenceBidRange[0]}-{month.referenceBidRange[1]} 元/MWh · 峰谷 {month.spread}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(8, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="retail-load-bar">
      <div>
        <span>{label}</span>
        <strong>{formatNumber(value)} MW</strong>
      </div>
      <em>
        <i style={{ width: `${width}%` }} />
      </em>
    </div>
  );
}

function PriceCurveRow({ day, priceMin, priceMax }: { day: RetailTypicalDayMarketContext; priceMin: number; priceMax: number }) {
  return (
    <div className="retail-price-curve-row">
      <div className="retail-price-curve-label">
        <span>{day.monthLabel}</span>
        <strong>{day.name}</strong>
      </div>
      <div className="retail-price-bars" aria-label={`${day.name} 24 小时现货价格`}>
        {day.spotPrices.map((price, hour) => (
          <span
            key={`${day.id}-${hour}-${price}`}
            className={price === day.peakPrice ? "peak" : price === day.valleyPrice ? "valley" : ""}
            title={`${String(hour).padStart(2, "0")}:00 ${price} 元/MWh`}
            style={{ height: getPriceBarHeight(price, priceMin, priceMax) }}
          />
        ))}
      </div>
      <div className="retail-price-curve-stats">
        <span>低 {day.valleyPrice}</span>
        <strong>高 {day.peakPrice}</strong>
      </div>
    </div>
  );
}

function getPriceBarHeight(price: number, min: number, max: number) {
  if (max <= min) return "50%";
  const ratio = Math.max(0, Math.min(1, (price - min) / (max - min)));
  return `${18 + ratio * 78}%`;
}
