import { Download, Save, Upload } from "lucide-react";
import { Badge } from "../Badge";
import { ModeBoundaryNotice } from "../adax/ModeBoundaryNotice";
import type { RetailTrainingNode } from "../../data/retailTrainingNodes";

interface RetailReviewOutputPanelProps {
  activeNode: RetailTrainingNode;
  saved: boolean;
  roleMaterialCount: number;
  materialSlotTotal: number;
  progressPercent: number;
  coveredNodeCount: number;
  nodeCount: number;
  filledActiveCount: number;
  canSave: boolean;
  onImport: (file: File | undefined) => Promise<void>;
  onExport: () => void;
  onSave: () => void;
  onRecords: () => void;
  onHome: () => void;
}

export function RetailReviewOutputPanel({
  activeNode,
  saved,
  roleMaterialCount,
  materialSlotTotal,
  progressPercent,
  coveredNodeCount,
  nodeCount,
  filledActiveCount,
  canSave,
  onImport,
  onExport,
  onSave,
  onRecords,
  onHome
}: RetailReviewOutputPanelProps) {
  return (
    <aside className="retail-result-panel">
      <div className="retail-panel-heading">
        <span>复盘输出</span>
        <Badge tone={saved ? "green" : "slate"}>{saved ? "已保存" : "本地草稿"}</Badge>
      </div>

      <div className="retail-review-progress">
        <div>
          <span>材料槽位</span>
          <strong>{roleMaterialCount}/{materialSlotTotal}</strong>
        </div>
        <i>
          <em style={{ width: `${progressPercent}%` }} />
        </i>
        <p>已覆盖 {coveredNodeCount}/{nodeCount} 个交易节点。</p>
      </div>

      <div className="retail-result-snapshot review">
        <span>当前节点</span>
        <strong>{activeNode.title}</strong>
        <p>{filledActiveCount > 0 ? `已沉淀 ${filledActiveCount} 条材料。` : "等待填写或导入材料。"}</p>
      </div>

      <details className="retail-side-action-drawer">
        <summary>材料导入 / 导出</summary>
        <div className="retail-side-action-stack">
          <label className="cockpit-primary-action retail-file-action" data-action="import-review-material">
            <Upload size={15} />
            导入培训材料
            <input
              type="file"
              accept=".txt,.md,.json,text/plain,application/json,text/markdown"
              onChange={async (event) => {
                await onImport(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>

          <button type="button" data-action="export-review-materials" className="cockpit-secondary-action" onClick={onExport}>
            <Download size={15} />
            导出复盘材料
          </button>
        </div>
      </details>

      <div className="retail-output-boundary">
        <ModeBoundaryNotice surface="reviewWorkspace" />
      </div>

      <button type="button" data-action="save-review-record" className="cockpit-primary-action" onClick={onSave} disabled={!canSave}>
        <Save size={15} />
        {saved ? "已保存复盘记录" : "保存复盘记录"}
      </button>
      {!roleMaterialCount ? <p className="retail-panel-microcopy">至少填写或导入一条材料后，可保存复盘记录。</p> : null}
      <button type="button" data-action="view-review-records" className="cockpit-secondary-action" onClick={onRecords}>
        查看训练记录
      </button>
      <button type="button" data-action="review-go-home" className="cockpit-secondary-action" onClick={onHome}>
        返回首页
      </button>
    </aside>
  );
}
