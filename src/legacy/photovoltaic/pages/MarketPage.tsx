import { ArrowRight, CloudSun, Gauge, Lightbulb, TriangleAlert } from "lucide-react";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { MetricCard } from "../../../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../../../components/Panel";
import { StepIndicator } from "../../../components/StepIndicator";
import { PowerForecastChart, PriceChart } from "../components/Charts";
import { knowledgeCards, photovoltaicScenario } from "../data/mockScenario";
import { formatNumber, round } from "../utils/calculations";

interface MarketPageProps {
  onNext: () => void;
}

const riskPeriods = [
  {
    period: "10:00-14:00",
    title: "光伏出力较高但价格偏低",
    detail: "午间边际收益下降，满额申报未必带来最优收益表现。",
    tone: "orange" as const
  },
  {
    period: "13:00-15:00",
    title: "云量波动，预测置信度下降",
    detail: "实际出力低于预测的概率上升，需谨慎控制偏差费用敞口。",
    tone: "red" as const
  },
  {
    period: "18:00-20:00",
    title: "价格较高但光伏出力下降",
    detail: "少量可发电量仍有价值，但不可因高价盲目申报夜间电量。",
    tone: "blue" as const
  }
];

const declarationJudgements = [
  {
    period: "10:00-12:00",
    judgement: "高出力叠加低价",
    action: "建议不要简单贴近预测上沿，优先控制收益效率。"
  },
  {
    period: "13:00-15:00",
    judgement: "低置信度风险段",
    action: "申报应向建议区间下沿收敛，避免实际出力不足带来偏差费用。"
  },
  {
    period: "17:00-18:00",
    judgement: "高价可发窗口",
    action: "在可发电量范围内避免过度保守，适度捕捉高价收益。"
  }
];

export function MarketPage({ onNext }: MarketPageProps) {
  const data = photovoltaicScenario.data;
  const totalForecast = data.reduce((total, item) => total + item.forecastPower, 0);
  const avgPrice = data.reduce((total, item) => total + item.dayAheadPrice, 0) / data.length;
  const lowConfidenceHours = data.filter((item) => item.confidenceLevel < 0.7).length;
  const maxForecast = Math.max(...data.map((item) => item.forecastPower));

  return (
    <div className="page-shell">
      <StepIndicator current="market" />
      <PageHeader
        eyebrow="市场信息分析"
        title="从市场信息读出申报判断"
        description="本页围绕功率预测、价格曲线、天气资源和风险提示四类信息展开。进入申报前，重点识别午间低价高出力、低置信度云量波动和晚高峰可发电量三类矛盾。"
        actions={
          <Button onClick={onNext} icon={<ArrowRight size={17} />}>
            进入日前申报
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-4 gap-4">
        <MetricCard label="训练日期" value={photovoltaicScenario.date} detail={photovoltaicScenario.stationName} tone="blue" />
        <MetricCard label="预测总电量" value={`${formatNumber(totalForecast, 1)} MWh`} detail="按 24 小时功率积分" tone="green" />
        <MetricCard label="最高预测出力" value={`${maxForecast} MW`} detail="12:00 预测峰值" tone="slate" />
        <MetricCard label="低置信度时段" value={`${lowConfidenceHours} 小时`} detail="集中在 13:00-15:00" tone="orange" />
      </section>

      <section className="mb-6 grid grid-cols-[1fr_340px] gap-6">
        <Panel eyebrow="判断框架" title="核心判断提示" subtitle="把四类信息转译为可执行的申报动作">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-teal-100 bg-teal-50/80 p-4">
              <Lightbulb className="text-teal-700" size={22} />
              <h3 className="mt-3 font-bold text-slate-950">午间不宜简单满发</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">10:00-14:00 电量充足但价格偏低，应看收益效率和偏差容忍度。</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50/80 p-4">
              <TriangleAlert className="text-orange-700" size={22} />
              <h3 className="mt-3 font-bold text-slate-950">低置信度要降风险</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">13:00-15:00 建议申报区间明显收窄，过高申报会放大偏差费用。</p>
            </div>
            <div className="rounded-lg border border-brand-100 bg-brand-50/80 p-4">
              <Gauge className="text-brand-700" size={22} />
              <h3 className="mt-3 font-bold text-slate-950">高价时段仍要捕捉</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">17:00-18:00 可发电量较少但价格高，低估申报会损失收益机会。</p>
            </div>
          </div>
        </Panel>

        <Panel eyebrow="场景底稿" title="训练日概览">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-slate-500">场站类型</span>
              <span className="font-semibold text-slate-900">{photovoltaicScenario.stationType}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-slate-500">可用容量</span>
              <span className="font-semibold text-slate-900">{photovoltaicScenario.availableCapacity} MW</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-slate-500">平均日前价格</span>
              <span className="font-semibold text-slate-900">{round(avgPrice, 0)} 元/MWh</span>
            </div>
          </div>
        </Panel>
      </section>

      <Panel eyebrow="申报前结论" title="进入申报页前要带走的 3 个判断" subtitle="这些判断会直接影响下一页的策略选择和手动修正" className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          {declarationJudgements.map((item, index) => (
            <div key={item.period} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <Badge tone={index === 0 ? "orange" : index === 1 ? "red" : "blue"}>{item.period}</Badge>
                <span className="text-xs font-semibold text-slate-400">申报判断</span>
              </div>
              <h3 className="text-base font-bold text-slate-950">{item.judgement}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.action}</p>
            </div>
          ))}
        </div>
      </Panel>

      <section className="mb-6 grid grid-cols-2 gap-6">
        <Panel eyebrow="信息一" title="功率预测" subtitle="预测出力与建议申报区间共同决定可申报电量边界">
          <div className="chart-card">
            <PowerForecastChart data={data} />
          </div>
        </Panel>
        <Panel eyebrow="信息二" title="价格曲线" subtitle="午间低价和晚高峰高价形成申报收益差异">
          <div className="chart-card">
            <PriceChart data={data} />
          </div>
        </Panel>
      </section>

      <section className="mb-6 grid grid-cols-[1fr_1fr] gap-6">
        <Panel eyebrow="信息三" title="天气资源" subtitle="用关键时点展示云量、辐照和预测置信度变化">
          <div className="grid grid-cols-3 gap-3">
            {[8, 12, 14, 17, 18, 20].map((hour) => {
              const item = data.find((point) => point.hour === hour)!;
              return (
                <div key={hour} className="subtle-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-950">{hour}:00</span>
                    <CloudSun size={18} className="text-teal-700" />
                  </div>
                  <p className="text-sm text-slate-600">{item.weatherType}</p>
                  <p className="mt-2 text-xs text-slate-500">云量 {item.cloudCover}% · 辐照 {item.irradiance} W/m²</p>
                  <p className="mt-1 text-xs text-slate-500">置信度 {round(item.confidenceLevel * 100, 0)}%</p>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel eyebrow="信息四" title="风险提示" subtitle="进入申报页前必须复核的三个重点时段">
          <div className="space-y-3">
            {riskPeriods.map((risk) => (
              <div key={risk.period} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <Badge tone={risk.tone}>{risk.period}</Badge>
                  <TriangleAlert size={17} className="text-orange-600" />
                </div>
                <h3 className="mt-3 font-bold text-slate-950">{risk.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{risk.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel eyebrow="知识提示" title="知识卡片区" subtitle="辅助评审对象快速对齐训练口径">
        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(knowledgeCards) as Array<[keyof typeof knowledgeCards, string]>).map(([key, value]) => (
            <div key={key} className="subtle-card p-4">
              <Badge tone="blue">{key}</Badge>
              <p className="mt-3 text-sm leading-6 text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
