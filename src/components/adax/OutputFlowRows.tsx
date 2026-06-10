import type { AdaxTrainingMode } from "../../types";

interface OutputFlowRowsProps {
  stage: "settlement" | "review" | "records";
  saved?: boolean;
  mode?: AdaxTrainingMode;
}

export function OutputFlowRows({ stage, saved = false, mode = "execution" }: OutputFlowRowsProps) {
  const stageIndex = stage === "settlement" ? 0 : stage === "review" ? 1 : 2;
  const rows =
    mode === "review"
      ? [
          {
            title: "复盘工作台",
            detail: "沿交易节点填写个人理解、教材摘录和业务案例"
          },
          {
            title: "材料保存",
            detail: "将复盘材料和材料摘要保存到当前浏览器"
          },
          {
            title: "训练记录",
            detail: saved || stage === "records" ? "已进入本地训练档案" : "保存后进入本地训练档案"
          }
        ]
      : [
          {
            title: "结算结果",
            detail: "确认收益、成本、风险和训练级结算口径"
          },
          {
            title: "结果回看",
            detail: "形成结果判断、风险归因和下一轮动作"
          },
          {
            title: "训练记录",
            detail: saved || stage === "records" ? "已进入本地训练档案" : "保存后进入本地训练档案"
          }
        ];

  return (
    <div className="output-flow-list">
      {rows.map((row, index) => {
        const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "idle";
        return (
          <div key={row.title} className={`output-flow-row ${state}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{row.title}</strong>
              <p>{row.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
