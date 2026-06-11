import { createEmptyRetailTrainingState } from "../../.test-build/src/domain/retailState.js";

export function completeRetailState() {
  const state = createEmptyRetailTrainingState();
  state.customerContracts = {
    industrialStableMwh: 60000,
    commercialPeakMwh: 30000,
    volatileLoadMwh: 15000
  };
  state.retailPackage.packageType = "fixed";
  state.annualBilateral = {
    coverageRatio: 100,
    bidPrice: 420,
    curveType: "industrial",
    counterpartyFloorPrice: 405,
    dealAccepted: null
  };
  state.monthlyAuctions = {
    march: {
      participates: true,
      coverageRatio: 10,
      bidPrice: 330,
      curveType: "typicalMonth"
    },
    july: {
      participates: false,
      coverageRatio: null,
      bidPrice: null,
      curveType: null
    },
    december: {
      participates: true,
      coverageRatio: 12,
      bidPrice: 500,
      curveType: "flat"
    }
  };
  return state;
}

export function basicTrainingRecord(id) {
  return {
    id,
    mode: "execution",
    scenarioId: "SCN-A-STD-001",
    scenarioName: "虚拟省级市场 A | 标准年度场景",
    roleId: "retailer",
    roleName: "售电公司",
    savedAt: "06/10 10:00",
    grossMargin: 1000,
    summary: "测试记录",
    diagnostics: ["测试诊断"]
  };
}

export function basicReviewMaterial(overrides = {}) {
  return {
    id: "SCN-A-STD-001-retailer-marketBrief-我的理解",
    nodeId: "marketBrief",
    scenarioId: "SCN-A-STD-001",
    participantType: "retailer",
    title: "市场行情",
    materialType: "我的理解",
    content: "年度供需和典型日价格会影响售电公司采购节奏。",
    createdAt: "2026-06-10T00:00:00.000Z",
    updatedAt: "2026-06-10T00:00:00.000Z",
    ...overrides
  };
}
