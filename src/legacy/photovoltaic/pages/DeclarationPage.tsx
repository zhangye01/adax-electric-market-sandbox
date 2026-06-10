import { ArrowRight, ClipboardCheck, Edit3, ShieldAlert, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { DeclarationChart } from "../components/Charts";
import { MetricCard } from "../../../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../../../components/Panel";
import { StepIndicator } from "../../../components/StepIndicator";
import { photovoltaicScenario } from "../data/mockScenario";
import type { StrategyId } from "../types";
import {
  calculateTrainingResult,
  formatCurrency,
  formatHour,
  generateStrategyDeclarations,
  getDeclarationWarnings,
  round
} from "../utils/calculations";

interface DeclarationPageProps {
  declarations: number[];
  onDeclarationsChange: (declarations: number[]) => void;
  onSubmit: () => void;
}

const strategyButtons: Array<{ id: Exclude<StrategyId, "custom">; title: string; description: string }> = [
  { id: "steady", title: "稳健申报", description: "预测出力 × 0.88" },
  { id: "balanced", title: "均衡申报", description: "预测出力 × 0.94" },
  { id: "aggressive", title: "积极申报", description: "预测出力 × 1.00" }
];

const adjustmentHints = [
  {
    period: "13:00-15:00",
    title: "低置信度先降风险",
    detail: "云量波动时段建议贴近推荐区间下沿，避免偏差费用吞噬收益。"
  },
  {
    period: "17:00-18:00",
    title: "高价时段别漏电量",
    detail: "仍有少量可发电量，申报低于建议下限会削弱收益捕捉。"
  },
  {
    period: "夜间",
    title: "无出力必须归零",
    detail: "光伏夜间无可发能力，高价也不能转化为有效申报机会。"
  }
];

export function DeclarationPage({ declarations, onDeclarationsChange, onSubmit }: DeclarationPageProps) {
  const [strategy, setStrategy] = useState<StrategyId>("steady");
  const data = photovoltaicScenario.data;
  const warnings = useMemo(
    () => getDeclarationWarnings(photovoltaicScenario, declarations),
    [declarations]
  );
  const estimated = useMemo(
    () => calculateTrainingResult(photovoltaicScenario, declarations),
    [declarations]
  );
  const lowConfidenceExposure = data
    .filter((item) => item.confidenceLevel < 0.7)
    .reduce((total, item) => total + (declarations[item.hour] ?? 0), 0);
  const highPriceCapture = data
    .filter((item) => item.dayAheadPrice >= 450 && item.forecastPower > 0)
    .reduce((total, item) => total + (declarations[item.hour] ?? 0), 0);

  function applyStrategy(id: Exclude<StrategyId, "custom">) {
    setStrategy(id);
    onDeclarationsChange(generateStrategyDeclarations(photovoltaicScenario, id));
  }

  function updateDeclaration(index: number, value: string) {
    const parsed = Number(value);
    const nextValue = Number.isFinite(parsed)
      ? round(Math.min(Math.max(parsed, 0), photovoltaicScenario.availableCapacity), 1)
      : 0;
    const next = declarations.map((item, itemIndex) => (itemIndex === index ? nextValue : item));
    setStrategy("custom");
    onDeclarationsChange(next);
  }

  return (
    <div className="page-shell">
      <StepIndicator current="declaration" />
      <PageHeader
        eyebrow="日前申报"
        title="形成 24 小时日前申报方案"
        description="本页按“策略选择、申报表、曲线联动、风险提示、提交摘要”的工作台结构组织。可先选择快速策略，再对低置信度、高价可发和午间低价时段进行人工修正。"
        actions={
          <Button onClick={onSubmit} icon={<ArrowRight size={17} />}>
            提交申报并生成复盘
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-[1fr_370px] gap-6">
        <Panel eyebrow="任务摘要" title="申报任务摘要" subtitle="本轮仅模拟日前申报与收益复盘，不接入外部数据">
          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="场站" value={photovoltaicScenario.stationName} detail={photovoltaicScenario.stationType} tone="blue" />
            <MetricCard label="训练日期" value={photovoltaicScenario.date} detail="拟真典型日" tone="slate" />
            <MetricCard label="可用容量" value={`${photovoltaicScenario.availableCapacity} MW`} detail="逐小时申报上限" tone="green" />
            <MetricCard label="当前策略" value={strategyLabel(strategy)} detail="手动编辑后进入自定义" tone={strategy === "custom" ? "orange" : "blue"} />
          </div>
        </Panel>

        <Panel eyebrow="策略选择" title="快速策略选择" subtitle="点击后自动填充 24 小时申报值">
          <div className="space-y-3">
            {strategyButtons.map((item) => (
              <button
                key={item.id}
                onClick={() => applyStrategy(item.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                  strategy === item.id
                    ? "border-brand-700 bg-brand-50 text-brand-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50"
                }`}
              >
                <span>
                  <span className="block text-sm font-bold">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                </span>
                <SlidersHorizontal size={18} />
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <Panel eyebrow="人工修正" title="建议重点修改的时段" subtitle="不要平均修改整条曲线，优先处理会影响评分和收益解释的关键时段" className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          {adjustmentHints.map((item, index) => (
            <div key={item.period} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <Badge tone={index === 0 ? "orange" : index === 1 ? "blue" : "slate"}>{item.period}</Badge>
                <span className="text-xs font-semibold text-slate-400">手动复核</span>
              </div>
              <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <section className="mb-6 grid grid-cols-[1fr_370px] gap-6">
        <Panel eyebrow="申报表" title="24 小时申报表" subtitle="输入范围为 0 到可用容量 96 MW，低置信度时段已用浅橙底色提示">
          <div className="table-scroll max-h-[650px] overflow-auto rounded-lg border border-slate-200">
            <table className="data-table min-w-[940px] text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3">小时</th>
                  <th className="px-3 py-3">预测出力 MW</th>
                  <th className="px-3 py-3">建议申报区间 MW</th>
                  <th className="px-3 py-3">日前价格 元/MWh</th>
                  <th className="px-3 py-3">预测置信度</th>
                  <th className="px-3 py-3">用户申报 MW</th>
                  <th className="px-3 py-3">风险提示</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => {
                  const rowWarnings = getRowWarnings(item.hour, declarations[index] ?? 0);
                  return (
                    <tr key={item.hour} className={item.confidenceLevel < 0.7 ? "bg-orange-50/45" : "hover:bg-slate-50/70"}>
                      <td className="px-3 py-3 font-semibold text-slate-900">{formatHour(item.hour)}</td>
                      <td className="px-3 py-3 text-slate-700">{item.forecastPower}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {item.recommendedMin}-{item.recommendedMax}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">{item.dayAheadPrice}</td>
                      <td className="px-3 py-3">
                        <Badge tone={item.confidenceLevel < 0.7 ? "orange" : "green"}>
                          {round(item.confidenceLevel * 100, 0)}%
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          aria-label={`${formatHour(item.hour)} 用户申报 MW`}
                          className="h-9 w-24 rounded-md border border-slate-300 bg-white px-3 text-right font-semibold text-slate-950 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                          inputMode="decimal"
                          pattern="[0-9]*[.]?[0-9]*"
                          type="text"
                          value={declarations[index] ?? 0}
                          onChange={(event) => updateDeclaration(index, event.target.value)}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="max-w-[260px] text-xs leading-5 text-slate-600">
                          <p>{item.riskHint}</p>
                          {rowWarnings.map((warning) => (
                            <p key={warning} className="mt-1 font-semibold text-orange-700">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel eyebrow="风险提示" title="实时风险提示区" subtitle="随申报输入自动刷新，仅提示关键风险">
            {warnings.length === 0 ? (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 font-semibold text-emerald-800">
                  <ClipboardCheck size={18} />
                  当前申报未触发关键风险提示
                </div>
                <p className="mt-2 text-sm leading-6 text-emerald-700">仍建议在提交前重点复核 13:00-15:00 和 17:00-18:00。</p>
              </div>
            ) : (
              <div className="space-y-3">
                {warnings.slice(0, 7).map((warning) => (
                  <div key={warning} className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <ShieldAlert className="mt-0.5 shrink-0 text-orange-700" size={17} />
                    <p className="text-sm leading-6 text-orange-800">{warning}</p>
                  </div>
                ))}
                {warnings.length > 7 ? <p className="text-xs text-slate-500">另有 {warnings.length - 7} 条风险提示。</p> : null}
              </div>
            )}
          </Panel>

          <Panel eyebrow="提交摘要" title="提交前摘要" subtitle="用于提交前快速核对电量、收益和风险敞口">
            <div className="space-y-3">
              <MetricCard label="总申报电量" value={`${estimated.summary.totalDeclared} MWh`} detail="24 小时合计" tone="blue" />
              <MetricCard label="模拟综合收益" value={formatCurrency(estimated.summary.totalProfit)} detail="按本地 mock 实际出力测算" tone="green" />
              <MetricCard label="低置信度敞口" value={`${round(lowConfidenceExposure, 1)} MWh`} detail="13:00-15:00 申报合计" tone="orange" />
              <MetricCard label="高价时段捕捉" value={`${round(highPriceCapture, 1)} MWh`} detail="17:00-18:00 可发时段" tone="slate" />
            </div>
          </Panel>
        </div>
      </section>

      <Panel
        eyebrow="曲线联动"
        title="曲线联动区"
        subtitle="预测出力、用户申报和日前价格同图展示；修改表格后曲线即时刷新"
        action={
          <Badge tone={strategy === "custom" ? "orange" : "teal"}>
            <Edit3 size={13} className="mr-1" />
            {strategyLabel(strategy)}
          </Badge>
        }
      >
        <div className="chart-card">
          <DeclarationChart data={data} declarations={declarations} />
        </div>
        <div className="mt-4 flex items-center justify-end">
          <Button onClick={onSubmit} icon={<TrendingUp size={17} />}>
            提交申报并生成复盘
          </Button>
        </div>
      </Panel>
    </div>
  );

  function getRowWarnings(hour: number, declared: number) {
    const item = data[hour];
    const rowWarnings: string[] = [];
    if (item.forecastPower === 0 && declared > 0) rowWarnings.push("夜间建议为 0");
    if (item.confidenceLevel < 0.7 && declared > item.recommendedMax) rowWarnings.push("低置信度申报偏高");
    if (item.dayAheadPrice >= 450 && item.forecastPower > 0 && declared < item.recommendedMin) {
      rowWarnings.push("高价时段申报偏低");
    }
    if (item.dayAheadPrice <= 180 && declared > item.recommendedMax) rowWarnings.push("低价时段偏积极");
    return rowWarnings;
  }
}

function strategyLabel(strategy: StrategyId) {
  const labels: Record<StrategyId, string> = {
    steady: "稳健申报",
    balanced: "均衡申报",
    aggressive: "积极申报",
    custom: "自定义"
  };
  return labels[strategy];
}
