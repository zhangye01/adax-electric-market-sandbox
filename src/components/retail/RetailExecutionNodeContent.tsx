import type { SetStateAction } from "react";
import type { RetailNodeId, RetailSettlementResult, RetailTrainingState } from "../../domain/retailTypes";
import { CustomerLoadNode } from "./RetailCustomerLoadNode";
import { MarketBriefNode } from "./RetailMarketBriefNode";
import { ResultReviewNode, SettlementNode, SpotExposureNode } from "./RetailOutcomeNodes";
import { AnnualBilateralNode, MonthlyAuctionNode, RetailPackageNode } from "./RetailTradeActionNodes";

interface RetailExecutionNodeContentProps {
  activeNodeId: RetailNodeId;
  state: RetailTrainingState;
  settlement: RetailSettlementResult | null;
  validationErrors: string[];
  saved: boolean;
  onChange: (state: SetStateAction<RetailTrainingState>) => void;
}

export function RetailExecutionNodeContent({
  activeNodeId,
  state,
  settlement,
  validationErrors,
  saved,
  onChange
}: RetailExecutionNodeContentProps) {
  if (activeNodeId === "marketBrief") return <MarketBriefNode />;
  if (activeNodeId === "customerLoad") {
    return <CustomerLoadNode state={state} onChange={onChange} />;
  }
  if (activeNodeId === "retailPackage") return <RetailPackageNode state={state} onChange={onChange} />;
  if (activeNodeId === "annualBilateral") return <AnnualBilateralNode state={state} onChange={onChange} />;
  if (activeNodeId === "monthlyAuction") return <MonthlyAuctionNode state={state} onChange={onChange} />;
  if (activeNodeId === "spotExposure") return <SpotExposureNode settlement={settlement} validationErrors={validationErrors} />;
  if (activeNodeId === "settlement") return <SettlementNode settlement={settlement} validationErrors={validationErrors} />;
  if (activeNodeId === "resultReview") return <ResultReviewNode settlement={settlement} validationErrors={validationErrors} saved={saved} />;
  return null;
}
