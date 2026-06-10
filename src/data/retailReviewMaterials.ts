import type { RetailNodeId } from "../domain/retailTypes";
import type { UserMaterial } from "../types";

export const retailReviewMaterialTypes = ["我的理解", "教材摘录", "业务案例"] as const;

export const retailReviewNodePrompts: Record<RetailNodeId, string[]> = {
  marketBrief: ["年度供需是否偏紧？", "哪些月份更容易出现价格风险？", "典型日价格曲线给了什么操作依据？"],
  customerLoad: ["客户签约规模为什么会影响风险？", "不同客户曲线对现货敞口有什么影响？", "哪些客户更适合保守采购？"],
  retailPackage: ["套餐如何决定收入稳定性？", "固定价、分时价、现货联动分别转移了什么风险？", "套餐与客户曲线如何匹配？"],
  annualBilateral: ["年度双边解决什么问题？", "对手方为什么会拒绝低价？", "合约曲线为什么不能只看总量？"],
  monthlyAuction: ["月度竞价为什么可以补仓？", "哪些典型月值得参与？", "不参与会留下什么风险？"],
  spotExposure: ["为什么 100% 覆盖仍可能有现货敞口？", "正敞口和负敞口分别意味着什么？", "高价时段敞口为什么更关键？"],
  settlement: ["收入、采购成本、风险修正如何共同形成毛利？", "哪些结果是操作造成的？", "哪些结果来自市场环境？"],
  resultReview: ["本轮交易动作如何串成一条链？", "下一轮要优先改变哪个动作？", "这轮训练沉淀了哪些可复用判断？"]
};

export function placeholderForRetailReviewMaterial(type: UserMaterial["materialType"]) {
  if (type === "我的理解") return "写下你对这个交易节点的理解...";
  if (type === "教材摘录") return "导入或粘贴教材、规则、培训材料...";
  return "记录业务案例、课堂讨论或项目经验...";
}
