import type { RetailMarketData } from "../domain/retailTypes";
import { typicalDaySpotPriceCurves } from "./retailCurves";

export const retailMarketData: RetailMarketData = {
  annual: {
    referenceServiceMwh: 120000,
    averageSpotPrice: 410,
    longTermReferenceRange: [380, 450],
    maxLoadMw: 22000,
    minLoadMw: 9800,
    peakValleySpreadMw: 12200,
    highPriceHours: 720,
    lowPriceHours: 580,
    priceBounds: [200, 800],
    counterpartyFloorPrice: 405
  },
  customerPools: {
    industrialStable: {
      id: "industrialStable",
      name: "工业稳定型客户",
      maxContractMwh: 80000,
      sizeTag: "大体量",
      riskTag: "基础负荷稳定，峰谷差较小。"
    },
    commercialPeak: {
      id: "commercialPeak",
      name: "商业峰段型客户",
      maxContractMwh: 50000,
      sizeTag: "中体量",
      riskTag: "白天和晚峰负荷明显，高价时段敏感。"
    },
    volatileLoad: {
      id: "volatileLoad",
      name: "波动负荷型客户",
      maxContractMwh: 30000,
      sizeTag: "中小体量",
      riskTag: "预测难度高，容易形成曲线错配。"
    }
  },
  packages: {
    fixed: {
      id: "fixed",
      name: "固定价套餐",
      fixedPrice: 500,
      description: "客户零售价固定，售电公司承担较多批发侧价格波动。"
    },
    tou: {
      id: "tou",
      name: "分时价套餐",
      valleyPrice: 360,
      flatPrice: 500,
      peakPrice: 680,
      description: "峰平谷价格不同，适合训练客户负荷曲线和套餐收入的关系。"
    },
    spotLinked: {
      id: "spotLinked",
      name: "现货联动套餐",
      spotFactor: 0.85,
      serviceFee: 70,
      description: "客户价格随现货价格部分联动，售电公司可传导部分批发侧风险。"
    }
  },
  typicalMonths: {
    march: {
      id: "march",
      name: "3 月 | 新能源大发低价月",
      baseDemandMwh: 8800,
      averageSpotPrice: 335,
      referenceBidRange: [300, 380],
      daysInMonth: 31,
      typicalDayId: "marchLowPrice",
      feature: "低价窗口多，补仓价格过高会压缩毛利。"
    },
    july: {
      id: "july",
      name: "7 月 | 迎峰度夏高价月",
      baseDemandMwh: 12800,
      averageSpotPrice: 520,
      referenceBidRange: [470, 560],
      daysInMonth: 31,
      typicalDayId: "julyHighPrice",
      feature: "高价窗口多，补仓不足会放大敞口成本。"
    },
    december: {
      id: "december",
      name: "12 月 | 冬季晚峰紧张月",
      baseDemandMwh: 11600,
      averageSpotPrice: 485,
      referenceBidRange: [440, 530],
      daysInMonth: 31,
      typicalDayId: "decemberEveningPeak",
      feature: "晚峰尖峰价格明显，曲线适配重要。"
    }
  },
  typicalDays: {
    marchLowPrice: {
      id: "marchLowPrice",
      month: "march",
      name: "春季新能源大发低价日",
      dayWeight: 30,
      spotPrices: typicalDaySpotPriceCurves.marchLowPrice
    },
    julyHighPrice: {
      id: "julyHighPrice",
      month: "july",
      name: "夏季高峰高价日",
      dayWeight: 40,
      spotPrices: typicalDaySpotPriceCurves.julyHighPrice
    },
    decemberEveningPeak: {
      id: "decemberEveningPeak",
      month: "december",
      name: "冬季晚峰紧张日",
      dayWeight: 35,
      spotPrices: typicalDaySpotPriceCurves.decemberEveningPeak
    }
  }
};
