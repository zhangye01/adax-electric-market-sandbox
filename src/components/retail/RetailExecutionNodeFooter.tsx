import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw
} from "lucide-react";

interface RetailExecutionNodeFooterProps {
  errors: string[];
  hasNextNode: boolean;
  canEnterSettlement: boolean;
  onReset: () => void;
  onNextNode: () => void;
  onEnterSettlement: () => void;
}

export function RetailExecutionNodeFooter({
  errors,
  hasNextNode,
  canEnterSettlement,
  onReset,
  onNextNode,
  onEnterSettlement
}: RetailExecutionNodeFooterProps) {
  return (
    <div className="retail-node-footer">
      <ValidationBlock errors={errors} />
      <div className="retail-node-actions">
        <button type="button" data-action="reset-retail-state" className="cockpit-secondary-action" onClick={onReset}>
          <RotateCcw size={15} />
          重置
        </button>
        {hasNextNode ? (
          <button type="button" data-action="next-retail-node" className="cockpit-primary-action" onClick={onNextNode}>
            下一节点
            <ArrowRight size={15} />
          </button>
        ) : (
          <button type="button" data-action="enter-settlement" className="cockpit-primary-action" disabled={!canEnterSettlement} onClick={onEnterSettlement}>
            进入结算结果
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function ValidationBlock({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return (
      <div className="retail-validation ok">
        <CheckCircle2 size={16} />
        <span>当前节点校验通过</span>
      </div>
    );
  }

  return (
    <div className="retail-validation error">
      <AlertTriangle size={16} />
      <span>{errors[0]}</span>
    </div>
  );
}
