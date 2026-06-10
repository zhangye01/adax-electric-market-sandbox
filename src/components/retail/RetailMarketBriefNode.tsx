import { retailMarketData } from "../../data/retailMarketData";
import { getRetailMarketContext } from "../../domain/retailMarketContext";
import { RetailMarketSituationBoard } from "./RetailMarketSituationBoard";

export function MarketBriefNode() {
  const marketContext = getRetailMarketContext(retailMarketData);

  return (
    <div className="retail-node-content">
      <RetailMarketSituationBoard context={marketContext} variant="compact" />

      <div className="retail-next-action-strip">
        <span>下一步</span>
        <strong>确定客户负荷，再决定零售套餐和中长期采购仓位。</strong>
      </div>
    </div>
  );
}
