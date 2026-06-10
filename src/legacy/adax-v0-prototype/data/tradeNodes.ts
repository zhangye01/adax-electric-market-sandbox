import type { TradeNode } from "../types";

const materialSlots = [
  {
    id: "understanding",
    title: "我的理解",
    type: "note" as const,
    description: "用自己的话解释这个节点为什么重要。"
  },
  {
    id: "excerpt",
    title: "教材摘录",
    type: "rule" as const,
    description: "粘贴教材、规则、培训材料中的相关片段。"
  },
  {
    id: "case",
    title: "业务案例",
    type: "case" as const,
    description: "记录项目、培训或市场案例中与该节点相关的经验。"
  }
];

export const tradeNodes: TradeNode[] = [
  {
    id: "retailer-info-pack",
    title: "查看售电公司信息包",
    participantType: "retailer",
    step: 1,
    execution: {
      guidance: "阅读客户类型、负荷特征、套餐风险和合约参考价，为后续策略配置建立上下文。",
      requiredAction: "确认客户组合和批发侧价格风险来源。",
      formType: "info-pack"
    },
    review: {
      knowledgePrompt: "售电公司为什么必须先看客户负荷曲线和套餐结构？",
      standardExplanation:
        "售电公司的收益来自零售侧收入与批发侧采购成本之间的差额。客户负荷曲线决定高价时段电量暴露，套餐结构决定批发侧价格能否传导给用户。",
      materialSlots,
      commonMisunderstandings: ["只关注购电价格，忽略客户负荷形态。", "把固定价套餐理解为无风险套餐。"],
      relatedConcepts: ["客户组合", "零售套餐", "现货敞口", "合约覆盖率"]
    },
    outputs: ["主体风险提示", "客户负荷画像", "套餐适配判断"]
  },
  {
    id: "retailer-contract",
    title: "配置中长期采购合约",
    participantType: "retailer",
    step: 2,
    execution: {
      guidance: "填写合约电量和合约价格，系统校验价格区间和覆盖比例。",
      requiredAction: "形成中长期采购方案。",
      formType: "contract",
      validationRules: ["合约价格必须在边界内", "合约电量不得超过代理负荷 115%"]
    },
    review: {
      knowledgePrompt: "中长期合约为什么能降低现货敞口？覆盖率过高又有什么问题？",
      standardExplanation:
        "中长期合约把部分电量锁定在约定价格下，能够降低高价现货采购风险。但覆盖率过高时，低价现货时段的采购弹性下降，可能错过低价机会。",
      materialSlots,
      commonMisunderstandings: ["误以为合约覆盖越高越安全。", "忽略合约曲线与负荷曲线的匹配。"],
      relatedConcepts: ["现货敞口", "合约覆盖率", "峰谷价", "采购成本"]
    },
    outputs: ["合约覆盖率", "现货敞口", "采购成本结构"]
  },
  {
    id: "retailer-settlement",
    title: "查看售电结算结果",
    participantType: "retailer",
    step: 3,
    execution: {
      guidance: "查看零售收入、合约成本、现货成本、经营毛利和高价暴露。",
      requiredAction: "识别客户组合、套餐和合约策略如何共同影响毛利。",
      formType: "settlement"
    },
    review: {
      knowledgePrompt: "售电公司的收入、成本和毛利分别由哪些交易动作形成？",
      standardExplanation:
        "零售收入由客户电量和套餐价格形成；采购成本由中长期合约成本和现货敞口成本构成；经营毛利反映客户结构、套餐传导和合约覆盖是否匹配。",
      materialSlots,
      commonMisunderstandings: ["只看毛利绝对值，不拆收入和成本来源。", "忽略高价时段敞口对毛利的放大影响。"],
      relatedConcepts: ["零售收入", "采购成本", "高价暴露", "毛利率"]
    },
    outputs: ["收入成本拆解", "风险暴露", "复盘诊断"]
  },
  {
    id: "thermal-info-pack",
    title: "查看火电机组信息包",
    participantType: "thermal",
    step: 1,
    execution: {
      guidance: "查看机组容量、可用容量、边际成本、市场事件和参考报价。",
      requiredAction: "理解火电作为可控电源的报价约束。",
      formType: "info-pack"
    },
    review: {
      knowledgePrompt: "火电机组为什么要同时关注成本、可用容量和市场供需？",
      standardExplanation:
        "火电是可控电源，报价既要覆盖发电成本，也要考虑出清概率和边际机会。可用容量决定可参与出清的能力边界。",
      materialSlots,
      commonMisunderstandings: ["只把报价看成价格填写，不看容量约束。", "忽略燃料成本和检修事件对报价中枢的影响。"],
      relatedConcepts: ["可用容量", "边际成本", "供需紧张", "边际机组"]
    },
    outputs: ["机组能力边界", "成本参考", "市场事件提示"]
  },
  {
    id: "thermal-offer",
    title: "配置火电十段式报价",
    participantType: "thermal",
    step: 2,
    execution: {
      guidance: "填写 10 段负荷率和报价，系统按可用容量折算段容量并校验连续性。",
      requiredAction: "形成可用于派生出清的报价曲线。",
      formType: "thermal-offer",
      validationRules: ["必须包含 10 段", "负荷率连续不重叠", "报价在价格上下限内"]
    },
    review: {
      knowledgePrompt: "报价曲线如何体现成本、出清概率和收益预期？",
      standardExplanation:
        "十段式报价把机组可用容量拆成不同负荷率区间。较低报价提高出清概率，较高报价争取价格质量，最终需要在成本、出清电量和边际机会之间平衡。",
      materialSlots,
      commonMisunderstandings: ["简单认为报价越低越好。", "简单认为报价越高收益越高。", "忽略中高负荷段对边际价格的影响。"],
      relatedConcepts: ["负荷率", "报价段容量", "派生出清", "边际价格"]
    },
    outputs: ["十段报价曲线", "段容量", "校验结果"]
  },
  {
    id: "thermal-settlement",
    title: "查看火电结算结果",
    participantType: "thermal",
    step: 3,
    execution: {
      guidance: "查看出清电量、现货收入、中长期收入、发电成本、毛利和默认报价对比。",
      requiredAction: "判断报价策略是偏高、偏低还是与成本机会匹配。",
      formType: "settlement"
    },
    review: {
      knowledgePrompt: "火电报价、出清电量、合约覆盖和发电毛利之间是什么关系？",
      standardExplanation:
        "火电收益由中长期收入和现货收入共同形成，发电成本按出清电量发生。报价影响出清电量和派生价格，合约覆盖影响收入锁定程度。",
      materialSlots,
      commonMisunderstandings: ["只看现货收入，不看发电成本。", "只比较出清电量，不比较默认报价毛利。"],
      relatedConcepts: ["出清电量", "现货收入", "发电成本", "默认报价对比"]
    },
    outputs: ["派生出清结果", "收益拆解", "默认报价对比"]
  }
];

export function tradeNodesForRole(role: "retailer" | "thermal") {
  return tradeNodes.filter((node) => node.participantType === role).sort((a, b) => a.step - b.step);
}

export function tradeNodeById(nodeId: string) {
  return tradeNodes.find((node) => node.id === nodeId);
}
