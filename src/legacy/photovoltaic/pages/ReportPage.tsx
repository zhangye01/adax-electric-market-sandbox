import { ArrowLeft, Home, RotateCcw, Save, Shuffle, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import {
  BenchmarkChart,
  DeviationChart,
  ResultComparisonChart,
  RevenueBreakdownChart,
  ScoreBarChart
} from "../components/Charts";
import { MetricCard } from "../../../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../../../components/Panel";
import { StepIndicator } from "../../../components/StepIndicator";
import { photovoltaicScenario } from "../data/mockScenario";
import type { BenchmarkResult, HourlyResult, ScoreBreakdown, SummaryMetrics } from "../types";
import { formatCurrency, formatNumber, getReportNarrative, round } from "../utils/calculations";

interface ReportPageProps {
  hourlyResults: HourlyResult[];
  summary: SummaryMetrics;
  scores: ScoreBreakdown;
  benchmarks: BenchmarkResult[];
  saved: boolean;
  onSave: () => void;
  onRetry: () => void;
  onSwitchScenario: () => void;
  onHome: () => void;
}

const diagnoses = [
  {
    title: "高价时段收益捕捉不足",
    detail: "17:00-18:00 价格明显高于日内均值，但光伏出力下降，若申报低于建议下限会错失少量高价值电量。",
    tone: "blue" as const
  },
  {
    title: "午间低价时段申报偏积极",
    detail: "10:00-14:00 出力高但价格偏低，若贴近预测上沿申报，收益增量有限且会放大偏差费用敏感性。",
    tone: "orange" as const
  },
  {
    title: "低置信度时段风险识别不足",
    detail: "13:00-15:00 云量波动导致实际出力低于预测，申报曲线应主动向建议区间下沿收敛。",
    tone: "red" as const
  }
];

const roleInsights = {
  新员工: "先建立“预测、申报、成交、偏差、收益”的完整链路认知，避免只看单一电量指标。",
  营销人员: "向客户解释收益时，可用基准策略对比说明稳健、均衡和积极申报的取舍。",
  咨询顾问: "访谈和诊断时重点追问低置信度时段的人工修正机制与复盘闭环。",
  解决方案人员: "产品方案应突出数据阅读、风险提示、策略生成和复盘解释四类能力模块。",
  数智开发人员: "后续可将本地规则替换为真实业务规则引擎，并保留前端闭环交互作为验证入口。"
};

export function ReportPage({
  hourlyResults,
  summary,
  scores,
  benchmarks,
  saved,
  onSave,
  onRetry,
  onSwitchScenario,
  onHome
}: ReportPageProps) {
  const [activeRole, setActiveRole] = useState<keyof typeof roleInsights>("新员工");
  const scoreBars = [
    { label: "流程完成度", value: scores.processCompletion },
    { label: "申报合理性", value: scores.declarationRationality },
    { label: "偏差控制", value: scores.deviationControl },
    { label: "收益表现", value: scores.revenuePerformance },
    { label: "复盘理解度", value: scores.reviewUnderstanding }
  ];
  const nextActions = [
    "复核 13:00-15:00 是否应继续下调申报，降低低置信度偏差风险。",
    "复核 17:00-18:00 是否低估可发电量，避免高价时段收益遗漏。",
    "对比稳健、均衡、积极三类基准策略，确认当前策略画像是否符合岗位目标。"
  ];

  return (
    <div className="page-shell">
      <StepIndicator current="report" />
      <PageHeader
        eyebrow="复盘报告"
        title="日前申报训练复盘报告"
        description={getReportNarrative(scores, summary)}
        actions={
          <div className="flex gap-3">
            <Button onClick={onSave} icon={<Save size={17} />} disabled={saved}>
              {saved ? "已保存训练记录" : "保存训练记录"}
            </Button>
            <Button variant="secondary" onClick={onHome} icon={<Home size={17} />}>
              返回首页
            </Button>
          </div>
        }
      />

      <section className="mb-6 grid grid-cols-[0.82fr_1.18fr] gap-6">
        <Panel eyebrow="报告摘要" title="复盘总览" subtitle="综合评分、策略画像和关键财务结果">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-brand-100 bg-brand-50/80 p-5">
              <p className="text-sm font-semibold text-brand-700">综合评分</p>
              <p className="mt-3 text-6xl font-bold leading-none text-slate-950">{scores.totalScore}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">满分 100 分</p>
              <div className="mt-4 flex gap-2">
                <Badge tone={scores.totalScore >= 80 ? "green" : "orange"}>{scores.grade}</Badge>
                <Badge tone="blue">{scores.strategyProfile}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <MetricCard label="综合收益" value={formatCurrency(summary.totalProfit)} detail="发电收入扣除偏差费用" tone="green" />
              <MetricCard label="偏差费用" value={formatCurrency(summary.totalPenalty)} detail="简化偏差考核规则" tone="red" />
              <MetricCard label="总偏差率" value={`${round(summary.totalDeviationRate * 100, 1)}%`} detail="绝对偏差 / 总申报" tone="orange" />
            </div>
          </div>
        </Panel>

        <Panel eyebrow="核心指标" title="核心指标卡" subtitle="训练结果的电量、收入、费用和效率指标">
          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="总预测电量" value={`${formatNumber(summary.totalForecast)} MWh`} tone="slate" />
            <MetricCard label="总申报电量" value={`${formatNumber(summary.totalDeclared)} MWh`} tone="blue" />
            <MetricCard label="总实际出力" value={`${formatNumber(summary.totalActual)} MWh`} tone="green" />
            <MetricCard label="发电收入" value={formatCurrency(summary.totalRevenue)} tone="green" />
            <MetricCard label="偏差费用" value={formatCurrency(summary.totalPenalty)} tone="red" />
            <MetricCard label="综合收益" value={formatCurrency(summary.totalProfit)} tone="green" />
            <MetricCard label="单位收益" value={`${round(summary.unitProfit, 1)} 元/MWh`} tone="blue" />
            <MetricCard label="偏差费用占比" value={`${round(summary.penaltyRatio * 100, 2)}%`} tone="orange" />
          </div>
        </Panel>
      </section>

      <Panel eyebrow="结论先行" title="本轮复盘最有价值的 3 个结论" subtitle="适合在内部评审会上先讲清楚，再展开图表和明细" className="mb-6">
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
          <div className="rounded-lg border border-brand-100 bg-brand-50/80 p-5">
            <Badge tone="blue">策略画像</Badge>
            <h3 className="mt-3 text-base font-bold text-slate-950">{scores.strategyProfile}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              当前申报策略不是只看电量大小，而是由低置信度敞口、高价时段捕捉和总偏差率共同决定。
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 p-5">
            <Badge tone="green">收益表现</Badge>
            <h3 className="mt-3 text-base font-bold text-slate-950">{formatCurrency(summary.totalProfit)}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              综合收益需要同时看发电收入和偏差费用，不能只用总申报电量判断策略好坏。
            </p>
          </div>
          <div className="rounded-lg border border-orange-100 bg-orange-50/80 p-5">
            <Badge tone="orange">下一轮动作</Badge>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <section className="mb-6 grid grid-cols-[360px_1fr] gap-6">
        <Panel eyebrow="评分结构" title="评分结构">
          <ScoreBarChart scores={scoreBars} />
        </Panel>
        <Panel eyebrow="曲线对比" title="预测 / 申报 / 实际对比图" subtitle="用于判断申报曲线是否匹配实际出力和风险时段">
          <div className="chart-card">
            <ResultComparisonChart data={hourlyResults} />
          </div>
        </Panel>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-6">
        <Panel eyebrow="偏差分析" title="偏差分析图" subtitle="正值表示实际出力高于成交电量，负值表示实际不足">
          <div className="chart-card">
            <DeviationChart data={hourlyResults} />
          </div>
        </Panel>
        <Panel eyebrow="收益拆解" title="收益拆解" subtitle="展示逐小时发电收入、偏差费用和综合收益">
          <div className="chart-card">
            <RevenueBreakdownChart data={hourlyResults} />
          </div>
        </Panel>
      </section>

      <section className="mb-6 grid grid-cols-[1fr_430px] gap-6">
        <Panel eyebrow="策略对比" title="基准策略对比" subtitle="用于判断当前策略相对稳健、均衡、积极三类策略的收益表现">
          <div className="chart-card">
            <BenchmarkChart data={benchmarks} />
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="data-table text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3">策略</th>
                  <th className="px-4 py-3">申报电量</th>
                  <th className="px-4 py-3">综合收益</th>
                  <th className="px-4 py-3">偏差费用</th>
                  <th className="px-4 py-3">偏差率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-brand-50">
                  <td className="px-4 py-3 font-bold text-brand-800">当前申报</td>
                  <td className="px-4 py-3">{formatNumber(summary.totalDeclared)} MWh</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{formatCurrency(summary.totalProfit)}</td>
                  <td className="px-4 py-3 text-rose-700">{formatCurrency(summary.totalPenalty)}</td>
                  <td className="px-4 py-3">{round(summary.totalDeviationRate * 100, 1)}%</td>
                </tr>
                {benchmarks.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3">{formatNumber(item.totalDeclared)} MWh</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{formatCurrency(item.totalProfit)}</td>
                    <td className="px-4 py-3 text-rose-700">{formatCurrency(item.totalPenalty)}</td>
                    <td className="px-4 py-3">{round(item.deviationRate * 100, 1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel eyebrow="诊断建议" title="问题诊断与改进建议" subtitle="面向下一轮训练的可执行改进方向">
          <div className="space-y-3">
            {diagnoses.map((item, index) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <Badge tone={item.tone}>{`诊断 ${index + 1}`}</Badge>
                  {index === 0 ? <TrendingUp size={17} className="text-brand-700" /> : <TrendingDown size={17} className="text-orange-600" />}
                </div>
                <h3 className="mt-3 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel eyebrow="岗位启发" title="岗位业务启发" subtitle="将训练结果转化为不同岗位可理解的业务语言">
        <div className="grid grid-cols-[220px_1fr] gap-4">
          <div className="space-y-2">
            {(Object.keys(roleInsights) as Array<keyof typeof roleInsights>).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`w-full rounded-md px-4 py-3 text-left text-sm font-semibold transition ${
                  activeRole === role ? "bg-brand-700 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-6">
            <p className="text-sm font-semibold text-teal-700">{activeRole}</p>
            <p className="mt-3 text-base leading-8 text-slate-700">{roleInsights[activeRole]}</p>
          </div>
        </div>
      </Panel>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="secondary" onClick={onRetry} icon={<RotateCcw size={17} />}>
          重新训练本日期
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onSwitchScenario} icon={<Shuffle size={17} />}>
            切换训练场景
          </Button>
          <Button variant="secondary" onClick={onHome} icon={<ArrowLeft size={17} />}>
            返回首页
          </Button>
          <Button onClick={onSave} icon={<Save size={17} />} disabled={saved}>
            {saved ? "已保存训练记录" : "保存训练记录"}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        场景：{photovoltaicScenario.name} · 日期：{photovoltaicScenario.date} · 规则：离线简化训练模型
      </p>
    </div>
  );
}
