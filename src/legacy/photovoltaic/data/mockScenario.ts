import type { TrainingScenario } from "../types";

export const photovoltaicScenario: TrainingScenario = {
  id: "pv-high-output-low-price-20260722",
  name: "光伏高出力低价日申报训练",
  subtitle: "新能源场站日前申报与收益复盘训练",
  date: "2026-07-22",
  stationName: "星河光伏电站",
  stationType: "集中式光伏",
  installedCapacity: 100,
  availableCapacity: 96,
  levelTags: ["L1 认知演示级", "进阶", "年度拟真数据包", "集中式光伏"],
  data: [
    {
      hour: 0,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 310,
      confidenceLevel: 0.97,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴间多云",
      cloudCover: 18,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    },
    {
      hour: 1,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 300,
      confidenceLevel: 0.97,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴间多云",
      cloudCover: 18,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    },
    {
      hour: 2,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 295,
      confidenceLevel: 0.97,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴间多云",
      cloudCover: 18,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    },
    {
      hour: 3,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 292,
      confidenceLevel: 0.96,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴间多云",
      cloudCover: 20,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    },
    {
      hour: 4,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 290,
      confidenceLevel: 0.96,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴间多云",
      cloudCover: 20,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    },
    {
      hour: 5,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 305,
      confidenceLevel: 0.96,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴间多云",
      cloudCover: 20,
      irradiance: 0,
      riskHint: "日出前无稳定出力，避免提前申报。"
    },
    {
      hour: 6,
      forecastPower: 2,
      actualPower: 1,
      dayAheadPrice: 330,
      confidenceLevel: 0.93,
      recommendedMin: 0,
      recommendedMax: 2,
      weatherType: "晴",
      cloudCover: 15,
      irradiance: 80,
      riskHint: "爬坡刚开始，少量试探性申报即可。"
    },
    {
      hour: 7,
      forecastPower: 12,
      actualPower: 10,
      dayAheadPrice: 360,
      confidenceLevel: 0.91,
      recommendedMin: 9,
      recommendedMax: 12,
      weatherType: "晴",
      cloudCover: 14,
      irradiance: 210,
      riskHint: "早高峰价格尚可，但出力爬坡存在不确定性。"
    },
    {
      hour: 8,
      forecastPower: 34,
      actualPower: 32,
      dayAheadPrice: 310,
      confidenceLevel: 0.9,
      recommendedMin: 29,
      recommendedMax: 34,
      weatherType: "晴",
      cloudCover: 16,
      irradiance: 420,
      riskHint: "出力快速上升，申报可贴近预测下沿。"
    },
    {
      hour: 9,
      forecastPower: 58,
      actualPower: 56,
      dayAheadPrice: 245,
      confidenceLevel: 0.88,
      recommendedMin: 49,
      recommendedMax: 57,
      weatherType: "晴转多云",
      cloudCover: 24,
      irradiance: 620,
      riskHint: "价格开始走低，过度追量的收益边际下降。"
    },
    {
      hour: 10,
      forecastPower: 76,
      actualPower: 75,
      dayAheadPrice: 205,
      confidenceLevel: 0.86,
      recommendedMin: 63,
      recommendedMax: 72,
      weatherType: "多云",
      cloudCover: 32,
      irradiance: 760,
      riskHint: "出力高但价格偏低，注意低价时段收益效率。"
    },
    {
      hour: 11,
      forecastPower: 88,
      actualPower: 85,
      dayAheadPrice: 175,
      confidenceLevel: 0.84,
      recommendedMin: 72,
      recommendedMax: 82,
      weatherType: "多云",
      cloudCover: 38,
      irradiance: 830,
      riskHint: "午间低价明显，建议避免无差别满额申报。"
    },
    {
      hour: 12,
      forecastPower: 92,
      actualPower: 90,
      dayAheadPrice: 158,
      confidenceLevel: 0.82,
      recommendedMin: 74,
      recommendedMax: 84,
      weatherType: "多云",
      cloudCover: 42,
      irradiance: 860,
      riskHint: "出力峰值遇到低价，重点比较偏差风险与电量收益。"
    },
    {
      hour: 13,
      forecastPower: 90,
      actualPower: 72,
      dayAheadPrice: 152,
      confidenceLevel: 0.62,
      recommendedMin: 60,
      recommendedMax: 72,
      weatherType: "云量波动",
      cloudCover: 68,
      irradiance: 720,
      riskHint: "云量快速增加，预测置信度下降，申报过高易产生偏差费用。"
    },
    {
      hour: 14,
      forecastPower: 82,
      actualPower: 60,
      dayAheadPrice: 168,
      confidenceLevel: 0.58,
      recommendedMin: 52,
      recommendedMax: 65,
      weatherType: "云量波动",
      cloudCover: 74,
      irradiance: 650,
      riskHint: "低置信度时段，实际出力可能显著低于预测。"
    },
    {
      hour: 15,
      forecastPower: 66,
      actualPower: 54,
      dayAheadPrice: 205,
      confidenceLevel: 0.66,
      recommendedMin: 45,
      recommendedMax: 57,
      weatherType: "多云转晴",
      cloudCover: 56,
      irradiance: 560,
      riskHint: "云量仍不稳定，价格回升前应先控制偏差敞口。"
    },
    {
      hour: 16,
      forecastPower: 45,
      actualPower: 43,
      dayAheadPrice: 320,
      confidenceLevel: 0.78,
      recommendedMin: 36,
      recommendedMax: 44,
      weatherType: "晴间多云",
      cloudCover: 36,
      irradiance: 430,
      riskHint: "价格回升，若可发能力稳定可适度捕捉收益。"
    },
    {
      hour: 17,
      forecastPower: 22,
      actualPower: 20,
      dayAheadPrice: 465,
      confidenceLevel: 0.8,
      recommendedMin: 17,
      recommendedMax: 22,
      weatherType: "晴间多云",
      cloudCover: 30,
      irradiance: 260,
      riskHint: "晚高峰价格高，但光伏出力下降，避免低估可发电量。"
    },
    {
      hour: 18,
      forecastPower: 6,
      actualPower: 5,
      dayAheadPrice: 590,
      confidenceLevel: 0.83,
      recommendedMin: 4,
      recommendedMax: 6,
      weatherType: "晴",
      cloudCover: 22,
      irradiance: 90,
      riskHint: "价格处于高位，少量可发电量仍具有收益价值。"
    },
    {
      hour: 19,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 620,
      confidenceLevel: 0.95,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴",
      cloudCover: 20,
      irradiance: 0,
      riskHint: "日落后无光伏出力，高价不可盲目申报。"
    },
    {
      hour: 20,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 560,
      confidenceLevel: 0.95,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴",
      cloudCover: 20,
      irradiance: 0,
      riskHint: "夜间高价不代表光伏可交易电量。"
    },
    {
      hour: 21,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 430,
      confidenceLevel: 0.96,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴",
      cloudCover: 18,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    },
    {
      hour: 22,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 360,
      confidenceLevel: 0.96,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴",
      cloudCover: 18,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    },
    {
      hour: 23,
      forecastPower: 0,
      actualPower: 0,
      dayAheadPrice: 330,
      confidenceLevel: 0.96,
      recommendedMin: 0,
      recommendedMax: 0,
      weatherType: "晴",
      cloudCover: 18,
      irradiance: 0,
      riskHint: "夜间无光伏出力，建议申报为 0。"
    }
  ]
};

export const recommendedScenarios = [
  {
    id: "pv-high-output-low-price",
    title: "光伏高出力低价日申报训练",
    description: "识别午间低价与云量波动叠加下的申报边界，完成日前收益复盘。",
    tags: ["光伏", "日前申报", "偏差复盘"],
    status: "可训练"
  },
  {
    id: "wind-forecast-deviation",
    title: "风电预测偏差日风险训练",
    description: "围绕风况突变和偏差费用，演练保守与积极策略的收益差异。",
    tags: ["风电", "预测偏差", "风险控制"],
    status: "样例待开放"
  },
  {
    id: "high-price-volatility",
    title: "高价波动日收益捕捉训练",
    description: "在价格高波动时段寻找可发电量与收益捕捉之间的平衡点。",
    tags: ["高价波动", "收益捕捉", "策略比较"],
    status: "样例待开放"
  }
];

export const knowledgeCards = {
  日前申报: "市场主体在日前市场提交次日分时电量计划，是出清和收益结算的基础输入。",
  功率预测: "对新能源场站未来出力的估计，受天气、资源和设备状态影响。",
  出清价格: "市场在某一时段形成的成交价格，可用于估算申报电量的发电收入。",
  偏差电量: "实际出力与成交电量之间的差值，反映预测与申报策略的偏离程度。",
  偏差费用: "超出允许偏差范围后的考核费用，本原型使用简化规则模拟。",
  综合收益: "发电收入扣除偏差费用后的训练收益，用于评价策略效果。"
} as const;

export const annualOverview = [
  { label: "模拟交易日", value: "365 天" },
  { label: "时间粒度", value: "24 小时" },
  { label: "新能源场站", value: "8 个" },
  { label: "推荐训练任务", value: "36 个" },
  { label: "知识卡片", value: "72 张" }
];

export const capabilityMap = [
  "市场基础认知",
  "数据阅读能力",
  "申报决策能力",
  "风险识别能力",
  "复盘解释能力"
];
