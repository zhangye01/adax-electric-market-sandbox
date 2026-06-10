import type { RetailNodeId } from "./retailTypes";

export type RetailExecutionArtifact =
  | "marketContext"
  | "annualPriceSignals"
  | "typicalDayCurves"
  | "customerContractPortfolio"
  | "customerLoadCurve"
  | "annualServiceVolume"
  | "retailRevenueModel"
  | "annualContractPosition"
  | "annualContractCurve"
  | "monthlyContractPosition"
  | "monthlyContractCurve"
  | "spotExposureProfile"
  | "curveMismatchRisk"
  | "settlementResult"
  | "grossMarginResult"
  | "riskLevel"
  | "executionRecord"
  | "reviewFocus";

export interface RetailExecutionNodeContract {
  id: RetailNodeId;
  step: number;
  consumes: RetailExecutionArtifact[];
  produces: RetailExecutionArtifact[];
}

export const retailExecutionChainContracts: RetailExecutionNodeContract[] = [
  {
    id: "marketBrief",
    step: 1,
    consumes: [],
    produces: ["marketContext", "annualPriceSignals", "typicalDayCurves"]
  },
  {
    id: "customerLoad",
    step: 2,
    consumes: ["marketContext"],
    produces: ["customerContractPortfolio", "customerLoadCurve", "annualServiceVolume"]
  },
  {
    id: "retailPackage",
    step: 3,
    consumes: ["customerContractPortfolio", "customerLoadCurve"],
    produces: ["retailRevenueModel"]
  },
  {
    id: "annualBilateral",
    step: 4,
    consumes: ["marketContext", "annualServiceVolume", "customerLoadCurve"],
    produces: ["annualContractPosition", "annualContractCurve"]
  },
  {
    id: "monthlyAuction",
    step: 5,
    consumes: ["marketContext", "annualContractPosition", "customerLoadCurve"],
    produces: ["monthlyContractPosition", "monthlyContractCurve"]
  },
  {
    id: "spotExposure",
    step: 6,
    consumes: ["customerLoadCurve", "annualContractCurve", "monthlyContractCurve"],
    produces: ["spotExposureProfile", "curveMismatchRisk"]
  },
  {
    id: "settlement",
    step: 7,
    consumes: [
      "retailRevenueModel",
      "annualContractPosition",
      "monthlyContractPosition",
      "spotExposureProfile",
      "curveMismatchRisk"
    ],
    produces: ["settlementResult", "grossMarginResult", "riskLevel"]
  },
  {
    id: "resultReview",
    step: 8,
    consumes: ["settlementResult", "grossMarginResult", "riskLevel"],
    produces: ["executionRecord", "reviewFocus"]
  }
];

export function getRetailExecutionNodeContract(nodeId: RetailNodeId) {
  return retailExecutionChainContracts.find((node) => node.id === nodeId) ?? null;
}

export function validateRetailExecutionChainContracts(
  contracts: RetailExecutionNodeContract[] = retailExecutionChainContracts
) {
  const issues: string[] = [];
  const seenIds = new Set<RetailNodeId>();
  const availableArtifacts = new Set<RetailExecutionArtifact>();

  contracts.forEach((node, index) => {
    if (seenIds.has(node.id)) {
      issues.push(`重复节点：${node.id}`);
    }
    seenIds.add(node.id);

    if (node.step !== index + 1) {
      issues.push(`节点 ${node.id} 的 step 应为 ${index + 1}，当前为 ${node.step}`);
    }

    if (index === 0 && node.consumes.length > 0) {
      issues.push("第一个节点不应依赖前序产物。");
    }

    if (index > 0 && node.consumes.length === 0) {
      issues.push(`节点 ${node.id} 缺少前序输入。`);
    }

    node.consumes.forEach((artifact) => {
      if (!availableArtifacts.has(artifact)) {
        issues.push(`节点 ${node.id} 依赖尚未产生的产物：${artifact}`);
      }
    });

    node.produces.forEach((artifact) => availableArtifacts.add(artifact));
  });

  contracts.slice(0, -1).forEach((node, index) => {
    const laterConsumes = new Set(contracts.slice(index + 1).flatMap((nextNode) => nextNode.consumes));
    const hasDownstreamOutput = node.produces.some((artifact) => laterConsumes.has(artifact));
    if (!hasDownstreamOutput) {
      issues.push(`节点 ${node.id} 的产物没有被后续节点使用。`);
    }
  });

  return {
    ok: issues.length === 0,
    issues
  };
}
