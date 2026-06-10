import { ArrowRight, BriefcaseBusiness, CheckCircle2, GraduationCap, ListChecks, Target } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../../../components/Panel";
import { StepIndicator } from "../../../components/StepIndicator";
import { knowledgeCards, photovoltaicScenario } from "../data/mockScenario";

interface TaskPageProps {
  onNext: () => void;
}

const objectives = [
  "阅读光伏场站日前出力预测、价格和天气资源信息",
  "形成 24 小时日前申报策略并提交训练结果",
  "理解偏差费用、综合收益和策略画像之间的关系",
  "通过复盘识别高价时段、低价高出力时段和低置信度时段的策略差异"
];

const scoringRules = [
  { label: "流程完成度", weight: "10%" },
  { label: "申报合理性", weight: "30%" },
  { label: "偏差控制", weight: "25%" },
  { label: "收益表现", weight: "25%" },
  { label: "复盘理解度", weight: "10%" }
];

export function TaskPage({ onNext }: TaskPageProps) {
  const [activeKnowledge, setActiveKnowledge] = useState<keyof typeof knowledgeCards>("日前申报");

  return (
    <div className="page-shell">
      <StepIndicator current="task" />
      <PageHeader
        eyebrow="场景任务"
        title={photovoltaicScenario.name}
        description="以星河光伏电站为训练对象，完成从市场信息阅读、日前申报决策到收益复盘解释的完整闭环。"
        actions={
          <Button onClick={onNext} icon={<ArrowRight size={17} />}>
            进入市场信息分析
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {photovoltaicScenario.levelTags.map((tag, index) => (
          <Badge key={tag} tone={index === 0 ? "teal" : "blue"}>
            {tag}
          </Badge>
        ))}
      </div>

      <section className="grid grid-cols-[0.72fr_1.28fr] gap-6">
        <div className="space-y-6">
          <Panel eyebrow="角色设定" title="角色设定" subtitle="本轮训练以新能源交易辅助决策为核心">
            <div className="space-y-4">
              <div className="flex gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4">
                <BriefcaseBusiness className="mt-0.5 text-brand-700" size={22} />
                <div>
                  <h3 className="font-bold text-slate-950">新能源场站交易分析员</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    你需要基于预测功率、天气、价格和建议区间，形成星河光伏电站次日 24 小时申报曲线。
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="subtle-card p-4">
                  <p className="text-slate-500">场站</p>
                  <p className="mt-1 font-bold text-slate-950">{photovoltaicScenario.stationName}</p>
                </div>
                <div className="subtle-card p-4">
                  <p className="text-slate-500">训练日期</p>
                  <p className="mt-1 font-bold text-slate-950">{photovoltaicScenario.date}</p>
                </div>
                <div className="subtle-card p-4">
                  <p className="text-slate-500">装机容量</p>
                  <p className="mt-1 font-bold text-slate-950">{photovoltaicScenario.installedCapacity} MW</p>
                </div>
                <div className="subtle-card p-4">
                  <p className="text-slate-500">可用容量</p>
                  <p className="mt-1 font-bold text-slate-950">{photovoltaicScenario.availableCapacity} MW</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="评分规则" title="评分规则" subtitle="评分随用户申报结果动态变化">
            <div className="space-y-3">
              {scoringRules.map((rule) => (
                <div key={rule.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">{rule.label}</span>
                  <span className="text-sm font-bold text-brand-700">{rule.weight}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel eyebrow="场景背景" title="市场背景卡片" subtitle="本场景不还原某一省份真实规则，仅用于训练讨论">
            <div className="grid grid-cols-3 gap-4">
              <div className="subtle-card p-4">
                <GraduationCap className="text-brand-700" size={22} />
                <h3 className="mt-3 font-bold text-slate-950">认知演示级</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  以 24 小时粒度展示核心逻辑，降低规则复杂度。
                </p>
              </div>
              <div className="subtle-card p-4">
                <Target className="text-teal-700" size={22} />
                <h3 className="mt-3 font-bold text-slate-950">低价高出力日</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  午间光伏出力高但日前价格低，需关注收益效率。
                </p>
              </div>
              <div className="subtle-card p-4">
                <ListChecks className="text-orange-600" size={22} />
                <h3 className="mt-3 font-bold text-slate-950">云量波动</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  13:00-15:00 置信度下降，申报过高易带来偏差费用。
                </p>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="任务目标" title="任务目标">
            <div className="grid grid-cols-2 gap-3">
              {objectives.map((item) => (
                <div key={item} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={18} />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="知识点" title="涉及知识点" subtitle="点击知识点查看简要解释">
            <div className="grid grid-cols-[220px_1fr] gap-4">
              <div className="space-y-2">
                {(Object.keys(knowledgeCards) as Array<keyof typeof knowledgeCards>).map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveKnowledge(item)}
                    className={`w-full rounded-md px-4 py-3 text-left text-sm font-semibold transition ${
                      activeKnowledge === item ? "bg-brand-700 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-brand-100 bg-brand-50 p-5">
                <p className="text-sm font-semibold text-brand-700">{activeKnowledge}</p>
                <p className="mt-3 text-base leading-8 text-slate-700">{knowledgeCards[activeKnowledge]}</p>
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
