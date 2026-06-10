import type { AdaxRoleId } from "../types";

export interface AdaxRoleMeta {
  name: string;
  status: string;
  detail: string;
  tone: "blue" | "green" | "orange" | "slate";
}

export const roleMeta: Record<AdaxRoleId, AdaxRoleMeta> = {
  retailer: {
    name: "售电公司",
    status: "可训练",
    detail: "客户组合、零售套餐、中长期采购、现货敞口和毛利复盘。",
    tone: "green"
  },
  thermal: {
    name: "火电机组",
    status: "后续开放",
    detail: "作为市场背景主体保留，后续扩展中长期销售、十段式报价和出清结果。",
    tone: "orange"
  },
  renewable: {
    name: "新能源场站",
    status: "后续开放",
    detail: "后续扩展年度双边、月度集中竞价、月内挂牌和现货出力风险。",
    tone: "slate"
  },
  storage: {
    name: "独立储能",
    status: "后续开放",
    detail: "后续扩展只参与现货市场的充放电收益和价格窗口识别。",
    tone: "slate"
  }
};

export const roleNames: Record<AdaxRoleId, string> = {
  retailer: roleMeta.retailer.name,
  thermal: roleMeta.thermal.name,
  renewable: roleMeta.renewable.name,
  storage: roleMeta.storage.name
};
