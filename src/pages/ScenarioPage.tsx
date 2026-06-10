import { ShieldCheck } from "lucide-react";
import { Badge } from "../components/Badge";
import { RetailMarketSituationBoard } from "../components/retail/RetailMarketSituationBoard";
import { StepIndicator } from "../components/StepIndicator";
import { adaxScenarioMeta } from "../data/adaxScenarioMeta";
import { retailMarketData } from "../data/retailMarketData";
import { getRetailMarketContext } from "../domain/retailMarketContext";
import type { AdaxTrainingMode } from "../types";

interface ScenarioPageProps {
  mode: AdaxTrainingMode;
  onNext: () => void;
}

export function ScenarioPage({ mode, onNext }: ScenarioPageProps) {
  const modeLabel = mode === "execution" ? "执行模式" : "复盘模式";
  const marketContext = getRetailMarketContext(retailMarketData);
  const scenarioFacts = [
    ["市场年度", `${adaxScenarioMeta.marketYear} 虚拟年度`],
    ["年度口径", adaxScenarioMeta.dataGranularity.annual],
    ["月度口径", adaxScenarioMeta.dataGranularity.monthly],
    ["典型日口径", adaxScenarioMeta.dataGranularity.typicalDay],
    ["价格边界", `${adaxScenarioMeta.priceBounds.min}-${adaxScenarioMeta.priceBounds.max} 元/MWh`],
    ["场景状态", "已锁定"]
  ];
  const confirmationItems = [
    "年度供需边界",
    "三个月度交易窗口",
    "三条 24 小时典型日曲线",
    "进入主体选择"
  ];

  return (
    <div className="page-shell cockpit-page">
      <StepIndicator current="scenario" mode={mode} />
      <section className="flow-page-header">
        <div className="min-w-0">
          <p className="cockpit-kicker">MARKET SCENARIO</p>
          <h1>确认统一虚拟省级市场</h1>
          <div className="execution-workbench-steps" aria-label="市场场景确认路径">
            <span>看年度行情</span>
            <span>看典型月</span>
            <span>看典型日</span>
            <span>进入主体选择</span>
          </div>
        </div>
        <div className="flow-header-aside">
          <span>训练模式</span>
          <strong>{modeLabel}</strong>
          <p>下一步：选择训练主体</p>
          <button type="button" className="cockpit-primary-action flow-header-action" onClick={onNext}>
            选择训练主体
          </button>
        </div>
      </section>

      <section className="flow-page-grid">
        <main className="flow-main-panel">
          <div className="flow-panel-heading">
            <span>{adaxScenarioMeta.name}</span>
            <Badge tone="orange">已锁定</Badge>
          </div>

          <RetailMarketSituationBoard context={marketContext} />

          <div className="flow-scenario-hero">
            <div>
              <Badge tone="blue">统一市场背景</Badge>
              <h2>虚拟省级市场 A</h2>
              <p>本年度行情采用统一虚拟省级市场，不对应真实省份。后续年度双边、月度集中竞价和现货敞口均基于这套供需与价格环境。</p>
              <div className="flow-scenario-tags">
                <span>标准年度行情</span>
                <span>3 个典型月</span>
                <span>24 小时典型日</span>
              </div>
            </div>
            <div className="flow-scenario-lock">
              <ShieldCheck size={20} />
              <strong>场景已锁定</strong>
              <p>后续主体、交易动作和输出结果均基于此输入。</p>
            </div>
          </div>

          <details className="flow-scenario-support">
            <summary>
              <span>场景口径和事件窗口</span>
              <Badge tone="slate">辅助信息</Badge>
            </summary>
            <div className="flow-scenario-section">
              <div className="flow-panel-heading compact">
                <span>训练数据包口径</span>
                <Badge tone="slate">统一输入</Badge>
              </div>
              <div className="flow-data-list scenario">
                {scenarioFacts.map(([label, value]) => (
                  <div key={label} className="flow-data-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow-scenario-section">
              <div className="flow-panel-heading compact">
                <span>年度事件窗口</span>
                <Badge tone="orange">{adaxScenarioMeta.events.length} 个事件</Badge>
              </div>
              <div className="flow-event-grid">
                {adaxScenarioMeta.events.map((event) => (
                  <div key={event.id} className="flow-event-card">
                    <span>D{event.startDay}-D{event.endDay}</span>
                    <strong>{event.name}</strong>
                    <p>{event.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </details>

        </main>

        <aside className="flow-side-panel">
          <div className="flow-panel-heading">
            <span>场景确认</span>
            <Badge tone="green">可进入</Badge>
          </div>
          <div className="flow-scenario-confirmation">
            <span>{modeLabel}</span>
            <strong>市场输入已锁定</strong>
            <p>下一步选择训练主体。</p>
          </div>
          <p className="flow-side-section-title">确认项</p>
          <div className="flow-confirm-list">
            {confirmationItems.map((item, index) => (
              <div key={item} className="flow-confirm-row">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
          <button className="cockpit-primary-action" onClick={onNext}>
            选择训练主体
          </button>
        </aside>
      </section>
    </div>
  );
}
