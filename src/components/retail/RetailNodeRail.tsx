import type { ReactNode } from "react";
import { Badge } from "../Badge";
import { retailTrainingNodes, type RetailTrainingNode } from "../../data/retailTrainingNodes";
import type { RetailNodeId } from "../../domain/retailTypes";

interface RetailNodeRailProps {
  activeNodeId: RetailNodeId;
  badgeTone: "green" | "orange" | "slate";
  badgeLabel: string;
  onSelectNode: (nodeId: RetailNodeId) => void;
  renderNodeMeta?: (node: RetailTrainingNode) => ReactNode;
  children?: ReactNode;
}

export function RetailNodeRail({
  activeNodeId,
  badgeTone,
  badgeLabel,
  onSelectNode,
  renderNodeMeta,
  children
}: RetailNodeRailProps) {
  return (
    <aside className="retail-node-rail">
      <div className="retail-panel-heading">
        <span>当前链路</span>
        <Badge tone={badgeTone}>{badgeLabel}</Badge>
      </div>
      <div className="retail-node-list">
        {retailTrainingNodes.map((node) => (
          <button
            key={node.id}
            data-node-id={node.id}
            className={`retail-node-button ${node.id === activeNodeId ? "active" : ""}`}
            onClick={() => onSelectNode(node.id)}
          >
            <span>{String(node.step).padStart(2, "0")}</span>
            <strong>{node.title}</strong>
            {renderNodeMeta?.(node)}
          </button>
        ))}
      </div>
      {children}
    </aside>
  );
}
