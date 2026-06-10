import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "../Badge";
import { RetailSettlementSignalBoard } from "./RetailSettlementSignalBoard";
import { retailTypicalMonths } from "../../domain/retailState";
import type { RetailSettlementResult } from "../../domain/retailTypes";
import { formatEnergy } from "../../utils/formatters";
import { retailTypicalMonthShortLabels } from "../../utils/retailDisplay";

export function SpotExposureNode({
  settlement,
  validationErrors
}: {
  settlement: RetailSettlementResult | null;
  validationErrors: string[];
}) {
  if (!settlement) return <MissingResult errors={validationErrors} />;

  return (
    <div className="retail-node-content">
      <RetailSettlementSignalBoard settlement={settlement} variant="exposure" />
      <CompactResultHint text="即使年度覆盖比例为 100%，合约曲线与客户用电曲线不一致时，仍可能形成现货敞口。" />
    </div>
  );
}

export function SettlementNode({
  settlement,
  validationErrors
}: {
  settlement: RetailSettlementResult | null;
  validationErrors: string[];
}) {
  if (!settlement) return <MissingResult errors={validationErrors} />;

  return (
    <div className="retail-node-content">
      <RetailSettlementSignalBoard settlement={settlement} />
      <MonthlyAuctionSummary settlement={settlement} />
    </div>
  );
}

export function ResultReviewNode({
  settlement,
  validationErrors,
  saved
}: {
  settlement: RetailSettlementResult | null;
  validationErrors: string[];
  saved: boolean;
}) {
  if (!settlement) return <MissingResult errors={validationErrors} />;

  return (
    <div className="retail-node-content">
      <div className="retail-review-list">
        {settlement.diagnostics.map((item, index) => (
          <div key={item} className="retail-review-row">
            <span>{index + 1}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
      <CompactResultHint text={saved ? "本轮执行记录已保存到浏览器本地记录。" : "进入结算结果后，可以继续生成交易结果回看并保存记录。"} />
    </div>
  );
}

function MonthlyAuctionSummary({ settlement }: { settlement: RetailSettlementResult }) {
  return (
    <div className="retail-table-card">
      <div className="retail-panel-heading compact">
        <span>月度集中竞价结果</span>
        <Badge tone="slate">{formatEnergy(settlement.monthlyAuction.totalVolumeMwh)}</Badge>
      </div>
      {retailTypicalMonths.map((month) => {
        const result = settlement.monthlyAuction.byMonth[month];
        return (
          <div key={month} className="retail-table-row">
            <span>{retailTypicalMonthShortLabels[month]}</span>
            <strong>{result.participates ? "参与" : "不参与"}</strong>
            <em>{result.participates ? `${formatEnergy(result.volumeMwh)} / ${result.bidPrice} 元` : "未补仓"}</em>
          </div>
        );
      })}
    </div>
  );
}

function CompactResultHint({ text }: { text: string }) {
  return (
    <div className="retail-compact-hint" title={text}>
      <Info size={14} />
      <span>{text}</span>
    </div>
  );
}

function MissingResult({ errors }: { errors: string[] }) {
  return (
    <div className="retail-missing-result">
      <AlertTriangle size={20} />
      <strong>暂不能生成结果</strong>
      <p>{errors[0] ?? "请先完成交易动作。"}</p>
    </div>
  );
}
