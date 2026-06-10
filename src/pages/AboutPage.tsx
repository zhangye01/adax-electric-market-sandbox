import { Database, FileText, ShieldCheck, Workflow } from "lucide-react";

const adaxMeaningItems = [
  {
    letter: "A",
    word: "Adaptive",
    title: "适应不同市场规则、主体角色和交易场景"
  },
  {
    letter: "D",
    word: "Decision-making",
    title: "形成交易决策、报价决策与风险判断能力"
  },
  {
    letter: "A",
    word: "Auction",
    title: "理解竞价、出清与交易组织机制"
  },
  {
    letter: "X",
    word: "eXperience",
    title: "通过沙盘体验和实操训练建立业务概念"
  }
];

const boundaryItems = [
  "ADAX 采用统一虚拟省级市场，不对应任何真实省份。",
  "系统结果仅用于训练、教学、规则理解和复盘讨论。",
  "结算与出清机制为训练级简化模型，不代表真实市场结算结果。",
  "不得用于真实交易申报、投资决策或对外市场预测。"
];

const localDataItems = [
  "训练记录和复盘材料保存在当前浏览器本地存储。",
  "模板导入仅解析用户选择的本地文件，不上传文件。",
  "模板导出由浏览器本地生成，适合课堂分发和个人留档。",
  "更换浏览器、清理站点数据或切换设备后，本地记录可能不可见。"
];

export function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="home-kicker">Product Context</p>
        <h1>ADAX 的含义与边界</h1>
        <p>
          ADAX 是 Adaptive Decision-making & Auction eXperience 的缩写。这个页面集中说明工具定位、
          训练边界和本地数据规则；正式训练页面只围绕交易流程、节点操作和操作结果展开。
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-heading">
          <ShieldCheck size={22} />
          <div>
            <p className="home-kicker">Brand Meaning</p>
            <h2>ADAX 的含义</h2>
          </div>
        </div>
        <div className="about-meaning-grid">
          {adaxMeaningItems.map((item) => (
            <article key={`${item.letter}-${item.word}`} className="about-meaning-card">
              <span>{item.letter}</span>
              <strong>{item.word}</strong>
              <p>{item.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-grid">
        <article className="about-panel">
          <div className="about-panel-title">
            <Workflow size={20} />
            <h2>训练方式</h2>
          </div>
          <p>
            执行模式用于完成一轮模拟交易，复盘模式用于沿同一条交易节点沉淀规则、案例和个人理解。
            两种模式共享场景、主体和交易链路，但训练目标不同。
          </p>
        </article>

        <article className="about-panel">
          <div className="about-panel-title">
            <Database size={20} />
            <h2>虚拟市场</h2>
          </div>
          <p>
            ADAX 不复制某一个真实省份市场，而是构建训练级虚拟省级市场。统一市场背景让不同主体、
            不同策略和不同结果可以被放在同一套业务语境下比较和复盘。
          </p>
        </article>
      </section>

      <section className="about-section">
        <div className="about-section-heading">
          <ShieldCheck size={22} />
          <div>
            <p className="home-kicker">Model Boundary</p>
            <h2>模型边界</h2>
          </div>
        </div>
        <div className="about-list">
          {boundaryItems.map((item, index) => (
            <div key={item} className="about-list-row">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-section-heading">
          <FileText size={22} />
          <div>
            <p className="home-kicker">Local Data</p>
            <h2>数据与文件操作</h2>
          </div>
        </div>
        <div className="about-list">
          {localDataItems.map((item, index) => (
            <div key={item} className="about-list-row">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
