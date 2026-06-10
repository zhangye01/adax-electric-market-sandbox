import { BatteryCharging, CheckCircle2, Factory, Store, SunMedium } from "lucide-react";
import { Badge } from "../components/Badge";
import { RetailerInfoPack } from "../components/adax/RoleInfoPacks";
import { StepIndicator } from "../components/StepIndicator";
import { roleMeta } from "../data/adaxRoles";
import { retailTrainingNodes } from "../data/retailTrainingNodes";
import type { AdaxRoleId, AdaxTrainingMode } from "../types";

interface RolePageProps {
  mode: AdaxTrainingMode;
  selectedRole: "retailer";
  onSelectRole: (role: "retailer") => void;
  onNext: () => void;
}

export function RolePage({ mode, selectedRole, onSelectRole, onNext }: RolePageProps) {
  const selectableRoles = ["retailer"] as const;
  const observerRoles: Array<{
    id: Exclude<AdaxRoleId, "retailer">;
    icon: typeof Factory;
    seat: string;
    description: string;
  }> = [
    {
      id: "thermal",
      icon: Factory,
      seat: "发电侧供给席位",
      description: "作为供给侧和边际价格背景进入市场理解。"
    },
    {
      id: "renewable",
      icon: SunMedium,
      seat: "新能源供给席位",
      description: "用于理解低价窗口、绿色出力和月度交易背景。"
    },
    {
      id: "storage",
      icon: BatteryCharging,
      seat: "灵活调节席位",
      description: "用于理解现货价格窗口和充放电价值背景。"
    }
  ];
  const modeLabel = mode === "execution" ? "执行模式" : "复盘模式";
  const nextActionLabel = mode === "execution" ? "进入交易工作台" : "进入复盘工作台";
  const selectedRoleFocus = ["客户组合", "零售套餐", "年度双边", "月度竞价", "现货敞口"];
  const roleActionText = mode === "execution" ? "按节点完成售电交易动作" : "按节点沉淀售电交易材料";

  return (
    <div className="page-shell cockpit-page">
      <StepIndicator current="role" mode={mode} />
      <section className="flow-page-header">
        <div className="min-w-0">
          <p className="cockpit-kicker">PARTICIPANT SEAT</p>
          <h1>选择本轮操作席位</h1>
          <div className="execution-workbench-steps" aria-label="主体选择操作路径">
            <span>确认操作席位</span>
            <span>查看主体边界</span>
            <span>进入工作台</span>
          </div>
        </div>
        <div className="flow-header-aside">
          <span>当前主体</span>
          <strong>{roleMeta[selectedRole].name}</strong>
          <p>{modeLabel} · {mode === "execution" ? "下一步：交易工作台" : "下一步：复盘工作台"}</p>
          <button type="button" className="cockpit-primary-action flow-header-action" onClick={onNext}>
            {nextActionLabel}
          </button>
        </div>
      </section>

      <section className="flow-page-grid">
        <main className="flow-main-panel">
          <div className="flow-panel-heading">
            <span>本轮操作席位</span>
            <Badge tone={mode === "execution" ? "green" : "orange"}>
              {modeLabel}
            </Badge>
          </div>

          <div className="flow-role-grid role-entry-grid">
            {selectableRoles.map((role) => {
              const active = role === selectedRole;
              const Icon = Store;
              return (
                <button
                  key={role}
                  data-role-seat={role}
                  onClick={() => onSelectRole(role)}
                  className={`flow-role-card ${active ? "active" : ""}`}
                >
                  <div className="flow-role-meta">
                    <Badge tone={roleMeta[role].tone}>可进入</Badge>
                    <span className={`flow-role-choice-state ${active ? "active" : ""}`}>
                      {active ? <CheckCircle2 size={18} /> : <Icon size={20} />}
                    </span>
                  </div>
                  <strong>{roleMeta[role].name}</strong>
                  <p>{roleMeta[role].detail}</p>
                  <div className="flow-role-card-foot">
                    <span>{retailTrainingNodes.length} 个交易节点</span>
                    <em>{roleActionText}</em>
                  </div>
                </button>
              );
            })}
          </div>

          <details className="flow-participant-ecosystem">
            <summary>
              <span>市场观察席位</span>
              <Badge tone="slate">本轮不进入操作</Badge>
            </summary>
            <div className="flow-future-role-grid">
              {observerRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <div key={role.id} className="flow-future-role-card">
                    <Icon size={18} />
                    <Badge tone="slate">观察席</Badge>
                    <strong>{roleMeta[role.id].name}</strong>
                    <span>{role.seat}</span>
                    <p>{role.description}</p>
                  </div>
                );
              })}
            </div>
          </details>

          <details className="flow-role-support">
            <summary>
              <span>售电公司信息包</span>
              <Badge tone="slate">进入前可查看</Badge>
            </summary>
            <div className="flow-role-support-body">
              <div className="flow-info-panel">
                <div className="flow-panel-heading compact">
                  <span>操作边界</span>
                  <Badge tone="slate">本轮覆盖</Badge>
                </div>
                <div className="role-operation-boundary">
                  {[
                    ["客户签约", "选择三类客户的签约电量上限"],
                    ["零售套餐", "选择固定价、分时价或现货联动套餐"],
                    ["中长期采购", "完成年度双边和月度集中竞价"],
                    ["现货敞口", "查看曲线错配带来的风险修正"]
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flow-info-panel">
                <div className="flow-panel-heading compact">
                  <span>可签约客户池</span>
                  <Badge tone="green">售电公司</Badge>
                </div>
                <RetailerInfoPack />
              </div>
            </div>
          </details>
        </main>

        <aside className="flow-side-panel">
          <div className="flow-panel-heading">
            <span>席位确认</span>
            <Badge tone={roleMeta[selectedRole].tone}>{roleMeta[selectedRole].name}</Badge>
          </div>
          <div className="flow-seat-summary">
            <span>{roleMeta[selectedRole].name}</span>
            <strong>{modeLabel}</strong>
            <p>{roleActionText}</p>
          </div>
          <p className="flow-side-section-title">本轮操作对象</p>
          <div className="flow-focus-list">
            {selectedRoleFocus.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="flow-side-section-title">进入后节点</p>
          <div className="flow-step-list compact">
            {retailTrainingNodes.map((node) => (
              <div key={node.id} className="flow-step-row">
                <span>{String(node.step).padStart(2, "0")}</span>
                <strong>{node.title}</strong>
              </div>
            ))}
          </div>
          <button className="cockpit-primary-action flow-seat-primary-action" onClick={onNext}>
            {nextActionLabel}
          </button>
        </aside>
      </section>
    </div>
  );
}
