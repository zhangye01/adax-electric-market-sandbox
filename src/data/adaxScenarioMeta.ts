import { retailMarketData } from "./retailMarketData";

export interface AdaxScenarioEvent {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
  impact: string;
}

export interface AdaxScenarioMeta {
  id: string;
  name: string;
  marketYear: number;
  status: "locked";
  marketType: string;
  dataSource: string;
  usage: string;
  dataGranularity: {
    annual: string;
    monthly: string;
    typicalDay: string;
  };
  events: AdaxScenarioEvent[];
  priceBounds: {
    min: number;
    max: number;
  };
}

export const adaxScenarioMeta: AdaxScenarioMeta = {
  id: "SCN-A-STD-001",
  name: "虚拟省级市场 A | 标准年度场景",
  marketYear: 2026,
  status: "locked",
  marketType: "训练级虚拟市场",
  dataSource: "内置虚拟数据",
  usage: "理解供需环境、主体差异、交易组织、交易策略和结算结果",
  dataGranularity: {
    annual: "年度供需边界",
    monthly: "3 个典型月交易窗口",
    typicalDay: "3 条 24 小时典型日曲线"
  },
  events: [
    {
      id: "spring-renewable-low-price",
      name: "春季新能源大发低价窗口",
      startDay: 61,
      endDay: 91,
      impact: "低价时段增加，月度补仓价格过高会压缩售电毛利。"
    },
    {
      id: "summer-peak-load",
      name: "迎峰度夏高价窗口",
      startDay: 183,
      endDay: 213,
      impact: "高价暴露时段增加，未覆盖负荷会放大现货采购成本。"
    },
    {
      id: "winter-evening-peak",
      name: "冬季晚峰紧张窗口",
      startDay: 335,
      endDay: 365,
      impact: "晚峰价格抬升，合约曲线与客户用电曲线的错配风险更明显。"
    }
  ],
  priceBounds: {
    min: retailMarketData.annual.priceBounds[0],
    max: retailMarketData.annual.priceBounds[1]
  }
};

export const ADAX_SCENARIO_ID = adaxScenarioMeta.id;
