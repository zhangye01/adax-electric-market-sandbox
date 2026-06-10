import { BarChart3, BookOpen } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/Badge";
import { StepIndicator } from "../components/StepIndicator";
import { getAdaxModeDecisionState, getAdaxModeLaunchPath } from "../domain/adaxModeDecision";
import type { AdaxTrainingMode, AdaxTrainingRecord } from "../types";

interface ModeSelectionPageProps {
  records: AdaxTrainingRecord[];
  onChooseMode: (mode: AdaxTrainingMode) => void;
}

export function ModeSelectionPage({ records, onChooseMode }: ModeSelectionPageProps) {
  const [selectedMode, setSelectedMode] = useState<AdaxTrainingMode | null>(null);
  const executionRecordCount = records.filter((record) => record.mode === "execution").length;
  const reviewRecordCount = records.filter((record) => record.mode === "review").length;
  const modeProfiles = [
    {
      id: "execution" as const,
      label: "执行模式",
      icon: <BarChart3 size={20} />,
      title: "模拟执行一轮交易",
      description: "进入工作台后，按节点完成阅读、选择、报价、生成结果和保存记录。",
      suitedFor: ["走流程", "做选择", "看结果", "留记录"],
      outputs: ["策略动作", "结算结果", "结果回看"]
    },
    {
      id: "review" as const,
      label: "复盘模式",
      icon: <BookOpen size={20} />,
      title: "沿交易节点做复盘",
      description: "进入工作台后，在相同节点位置打开材料、整理依据、沉淀理解和保存记录。",
      suitedFor: ["看材料", "理依据", "写理解", "沉淀记录"],
      outputs: ["节点材料", "复盘摘要", "知识记录"]
    }
  ];
  const launchPath = getAdaxModeLaunchPath(selectedMode);
  const selectedProfile = modeProfiles.find((profile) => profile.id === selectedMode) ?? null;
  const decisionState = getAdaxModeDecisionState(selectedMode);

  return (
    <div className="page-shell cockpit-page">
      <div className="mb-5">
        <StepIndicator current="start" />
      </div>
      <section className="flow-page-header">
        <div className="min-w-0">
          <p className="cockpit-kicker">TRAINING MODE</p>
          <h1>确认本轮训练模式</h1>
          <div className="execution-workbench-steps" aria-label="模式确认操作路径">
            <span>选择模式</span>
            <span>锁定本轮任务</span>
            <span>进入市场场景</span>
          </div>
        </div>
        <div className="flow-header-aside">
          <span>当前状态</span>
          <strong>{decisionState.statusLabel}</strong>
          <p>{selectedProfile ? "确认后进入统一虚拟省级市场" : "先选择本轮训练模式"}</p>
        </div>
      </section>

      <section className="flow-page-grid">
        <main className="flow-main-panel">
          <div className="flow-panel-heading">
            <span>选择本轮训练方式</span>
            <Badge tone="slate">二选一</Badge>
          </div>

          <div className="flow-mode-grid mode-decision-grid">
            {modeProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                aria-pressed={selectedMode === profile.id}
                className={`flow-mode-card mode-decision-card ${profile.id} ${selectedMode === profile.id ? "selected" : ""}`}
                onClick={() => setSelectedMode(profile.id)}
              >
                <div className="flow-mode-card-head">
                  <span>{profile.label}</span>
                  {profile.icon}
                </div>
                <strong>{profile.title}</strong>
                <p>{profile.description}</p>
                <div className="mode-card-section">
                  <span>本轮动作</span>
                  <div className="flow-mode-points">
                    {profile.suitedFor.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <div className="mode-card-section">
                  <span>预期输出</span>
                  <div className="mode-output-pills">
                    {profile.outputs.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <em>{selectedMode === profile.id ? "已选择，待确认" : "选择此模式"}</em>
              </button>
            ))}
          </div>
        </main>

        <aside className="flow-side-panel">
          <div className="flow-panel-heading">
            <span>本轮路径</span>
            <Badge tone="slate">{records.length} 条记录</Badge>
          </div>
          <div className="mode-commitment-panel">
            <span>下一步</span>
            <strong>{decisionState.nextTitle}</strong>
            <p>{decisionState.helperText}</p>
            <button
              type="button"
              className="cockpit-primary-action mode-confirm-action"
              disabled={!decisionState.canConfirm}
              onClick={() => {
                if (selectedMode) onChooseMode(selectedMode);
              }}
            >
              {decisionState.confirmLabel}
            </button>
          </div>
          <div className="mode-path-stack" aria-label="本轮训练路径">
            {launchPath.map((item, index) => (
              <div key={item} className={index === 0 ? "active" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
          <p className="flow-side-section-title">已有记录</p>
          <div className="mode-record-summary">
            <div>
              <span>执行训练</span>
              <strong>{executionRecordCount} 条</strong>
            </div>
            <div>
              <span>复盘材料</span>
              <strong>{reviewRecordCount} 条</strong>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
