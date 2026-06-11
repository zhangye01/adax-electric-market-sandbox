import type { RetailExecutionWorkbenchContext } from "../../domain/retailExecutionWorkbench";

export function RetailExecutionContextBar({ context }: { context: RetailExecutionWorkbenchContext }) {
  return (
    <div className="retail-execution-context-bar" aria-label="当前交易节点上下文">
      <div className="retail-execution-context-primary">
        <span>{context.nodePositionLabel}</span>
        <strong>{context.nodeTitle}</strong>
        <p>{context.actionLabel}</p>
      </div>
      <div>
        <span>业务阶段</span>
        <strong>{context.stageLabel}</strong>
      </div>
      <div>
        <span>输入 / 输出</span>
        <strong>{context.artifactLabel}</strong>
      </div>
      <div className={`status-${context.statusTone}`}>
        <span>节点状态</span>
        <strong>{context.statusLabel}</strong>
      </div>
      <div>
        <span>下一动作</span>
        <strong>{context.nextActionLabel}</strong>
      </div>
    </div>
  );
}
