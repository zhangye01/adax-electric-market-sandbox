import { ArrowRight, ClipboardList, FileText, PlayCircle } from "lucide-react";
import type { AdaxScenarioMeta } from "../data/adaxScenarioMeta";
import type { AdaxTrainingRecord } from "../types";
import { formatCurrency } from "../utils/formatters";

interface HomePageProps {
  records: AdaxTrainingRecord[];
  scenario: AdaxScenarioMeta;
  onStart: () => void;
  onRecords: () => void;
}

export function HomePage({ records, scenario, onStart, onRecords }: HomePageProps) {
  return (
    <div className="home-page">
      <HomeHero onStart={onStart} onRecords={onRecords} />
      <ModeCards />
      <VirtualMarketCard scenario={scenario} />
      <TradeChainSection />
      <RecentRecords records={records} onRecords={onRecords} />
    </div>
  );
}

function HomeHero({ onStart, onRecords }: { onStart: () => void; onRecords: () => void }) {
  const steps = ["选择模式", "选择市场场景", "选择训练主体", "完成交易节点", "查看结算与复盘"];

  return (
    <section className="home-hero">
      <div className="home-hero-copy">
        <p className="home-kicker">ADAX Training Sandbox</p>
        <h1>ADAX 电力市场多主体交易实训沙盘</h1>
        <h2>用一条交易场景链路，完成模拟执行与复盘沉淀。</h2>
        <p>
          ADAX 面向电力市场从业者，通过统一虚拟省级市场，将主体角色、交易策略、价格环境、结算结果和复盘归因串联起来，
          帮助用户在可交互、可试错、可复盘的训练过程中理解电力市场运行逻辑。
        </p>
        <div className="home-actions">
          <button className="home-primary-button" onClick={onStart}>
            开始训练
            <ArrowRight size={16} />
          </button>
          <button className="home-secondary-button" onClick={onRecords}>
            查看训练记录
          </button>
        </div>
      </div>

      <div className="home-flow-card">
        <div className="home-flow-header">
          <span>训练路径</span>
          <span className="home-flow-caption">同一条链路，两种训练方式</span>
        </div>
        <div className="home-flow-list">
          {steps.map((step, index) => (
            <div key={step} className="home-flow-step">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModeCards() {
  return (
    <section className="home-section">
      <div className="home-section-heading">
        <p className="home-kicker">Training Modes</p>
        <h2>两种模式，一条交易链路</h2>
      </div>
      <div className="home-mode-grid">
        <article className="home-mode-card">
          <div className="home-mode-icon">
            <PlayCircle size={22} />
          </div>
          <h3>执行模式</h3>
          <p>
            跟着系统提示，完成一轮模拟交易。从场景理解、主体信息阅读、策略配置，到结算结果和交易结果回看，
            帮助用户把交易流程完整走一遍。
          </p>
          <div className="home-use-list">
            {["新员工入门", "交易流程演练", "业务培训", "方案讲解"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="home-mode-note">在开始训练中正式确认</div>
        </article>

        <article className="home-mode-card">
          <div className="home-mode-icon amber">
            <FileText size={22} />
          </div>
          <h3>复盘模式</h3>
          <p>
            沿着同一条交易场景链路，整理教材、规则、案例和个人理解。每一个交易节点都可以成为复盘沉淀节点，
            帮助用户把分散材料组织成场景化复盘体系。
          </p>
          <div className="home-use-list">
            {["规则学习", "培训材料沉淀", "咨询方法论建设", "内部业务共识"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="home-mode-note amber">在开始训练中正式确认</div>
        </article>
      </div>
    </section>
  );
}

function VirtualMarketCard({ scenario }: { scenario: AdaxScenarioMeta }) {
  const rows = [
    ["场景名称", scenario.name],
    ["场景状态", scenario.status === "locked" ? "已锁定" : scenario.status],
    ["市场类型", scenario.marketType],
    ["数据来源", scenario.dataSource],
    ["训练用途", scenario.usage]
  ];

  return (
    <section className="home-section">
      <div className="home-section-heading">
        <p className="home-kicker">Virtual Market</p>
        <h2>统一虚拟省级市场</h2>
        <p>
          ADAX 不直接复制某一个真实省份市场，而是构建一个用于训练的虚拟省级市场。所有训练都基于统一市场场景展开，
          使不同主体、不同策略和不同结果可以在同一套市场背景下被理解和复盘。
        </p>
      </div>
      <div className="home-market-card">
        {rows.map(([label, value]) => (
          <div key={label} className="home-market-row">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
        <div className="home-market-boundary">
          该场景用于训练，不对应任何真实省份，不代表真实市场结算结果。
        </div>
      </div>
    </section>
  );
}

function TradeChainSection() {
  const chain = [
    "选择模式",
    "选择市场场景",
    "选择训练主体",
    "查看主体信息包",
    "配置交易策略",
    "查看结算结果",
    "进入交易结果回看",
    "保存训练记录 / 沉淀复盘材料"
  ];

  return (
    <section className="home-section">
      <div className="home-section-heading">
        <p className="home-kicker">Transaction Chain</p>
        <h2>从交易动作到复盘沉淀</h2>
        <p>
          在执行模式下，这条链路是一轮模拟交易流程；在复盘模式下，这条链路是一套复盘组织框架。
          同一个交易节点，既可以承载操作训练，也可以承载规则解释、案例材料和个人理解。
        </p>
      </div>
      <div className="home-chain">
        {chain.map((item, index) => (
          <div key={item} className="home-chain-item">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentRecords({ records, onRecords }: { records: AdaxTrainingRecord[]; onRecords: () => void }) {
  const recentRecords = records.slice(0, 3);

  return (
    <section className="home-section">
      <div className="home-section-heading split">
        <div>
          <p className="home-kicker">Records</p>
          <h2>最近训练记录</h2>
        </div>
        <button className="home-text-button" onClick={onRecords}>
          查看全部
          <ClipboardList size={16} />
        </button>
      </div>

      {recentRecords.length === 0 ? (
        <div className="home-empty-records">
          暂无训练记录。完成第一轮训练后，可在这里继续查看交易结果回看和复盘材料。
        </div>
      ) : (
        <div className="home-record-list">
          {recentRecords.map((record) => (
            <article key={record.id} className="home-record-card">
              <div>
                <span>{record.savedAt}</span>
                <strong>{record.mode === "review" ? "复盘模式" : "执行模式"} · {record.roleName}</strong>
                <p>{record.scenarioName}</p>
              </div>
              <p>{record.mode === "review" ? record.summary : `${record.summary} 毛利 ${formatCurrency(record.grossMargin)}。`}</p>
              <button onClick={onRecords}>查看</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
