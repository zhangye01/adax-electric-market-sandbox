import { ArrowRight, BookOpen, CheckCircle2, Save } from "lucide-react";
import { useState } from "react";
import { RetailNodeAssist } from "./RetailNodeAssist";
import { RetailNodeRail } from "./RetailNodeRail";
import { RetailReviewMaterialGrid } from "./RetailReviewMaterialGrid";
import { RetailReviewOutputPanel } from "./RetailReviewOutputPanel";
import { RetailMarketSituationBoard } from "./RetailMarketSituationBoard";
import { retailReviewMaterialTypes, retailReviewNodePrompts } from "../../data/retailReviewMaterials";
import { retailTrainingNodes, type RetailTrainingNode } from "../../data/retailTrainingNodes";
import { retailMarketData } from "../../data/retailMarketData";
import { getRetailMarketContext } from "../../domain/retailMarketContext";
import { getRetailReviewMaterials, getRetailReviewMaterialStats } from "../../domain/retailReviewMaterials";
import type { RetailNodeId } from "../../domain/retailTypes";
import type { UserMaterial } from "../../types";
import { downloadTextFile } from "../../utils/download";

interface RetailReviewWorkspaceProps {
  scenarioId: string;
  materials: UserMaterial[];
  saved: boolean;
  onMaterialChange: (node: RetailTrainingNode, materialType: UserMaterial["materialType"], content: string) => void;
  onTemplateMessage: (message: string) => void;
  onSave: () => void;
  onRecords: () => void;
  onHome: () => void;
}

export function RetailReviewWorkspace({
  scenarioId,
  materials,
  saved,
  onMaterialChange,
  onTemplateMessage,
  onSave,
  onRecords,
  onHome
}: RetailReviewWorkspaceProps) {
  const [activeNodeId, setActiveNodeId] = useState<RetailNodeId>("marketBrief");
  const activeNode = retailTrainingNodes.find((node) => node.id === activeNodeId) ?? retailTrainingNodes[0];
  const activeNodeIndex = retailTrainingNodes.findIndex((node) => node.id === activeNode.id);
  const nextNode = retailTrainingNodes[activeNodeIndex + 1] ?? null;
  const reviewScope = { scenarioId, participantType: "retailer" as const };
  const marketContext = getRetailMarketContext(retailMarketData);
  const reviewStats = getRetailReviewMaterialStats(materials, reviewScope);
  const roleMaterials = reviewStats.materials;
  const activeNodeMaterials = getRetailReviewMaterials(materials, reviewScope, {
    nodeId: activeNode.id,
    filledOnly: false
  });
  const filledActiveCount = activeNodeMaterials.filter((item) => item.content.trim()).length;
  const canSave = roleMaterials.length > 0 && !saved;

  function materialValue(type: UserMaterial["materialType"]) {
    return activeNodeMaterials.find((item) => item.materialType === type)?.content ?? "";
  }

  async function importMaterial(file: File | undefined) {
    if (!file) return;
    const content = await file.text();
    onMaterialChange(activeNode, "教材摘录", content);
    onTemplateMessage(`已导入培训材料：${file.name}，写入当前节点“教材摘录”。`);
  }

  function exportMaterials() {
    downloadTextFile(
      "adax_retail_review_materials.json",
      JSON.stringify(
        {
          exportType: "ADAX_RETAIL_REVIEW_MATERIALS",
          scenarioId,
          participantType: "retailer",
          materials: roleMaterials
        },
        null,
        2
      ),
      "application/json;charset=utf-8"
    );
    onTemplateMessage("售电公司复盘材料已导出。");
  }

  return (
    <section className="retail-workbench retail-review-workbench">
      <RetailNodeRail
        activeNodeId={activeNode.id}
        badgeTone="orange"
        badgeLabel="8 节点"
        onSelectNode={setActiveNodeId}
        renderNodeMeta={(node) => {
          const filledCount = roleMaterials.filter((item) => item.nodeId === node.id).length;
          return <em>{filledCount}/{retailReviewMaterialTypes.length}</em>;
        }}
      />

      <main className="retail-operation-panel">
        <div className="retail-operation-head">
          <div>
            <p>节点 {activeNode.step}</p>
            <h2>{activeNode.title}</h2>
            <span className="retail-operation-mode review">材料整理</span>
          </div>
          <RetailNodeAssist
            mode="review"
            detail="导入培训材料到当前节点"
            activeNodeTitle={activeNode.title}
            onImport={importMaterial}
          />
        </div>

        <details className="retail-review-prompt-drawer">
          <summary>打开节点提问</summary>
          <div className="retail-review-prompt-grid">
            <div className="retail-review-prompt focus">
              <span>0</span>
              <p>{activeNode.reviewFocus}</p>
            </div>
            {retailReviewNodePrompts[activeNode.id].map((prompt, index) => (
              <div key={prompt} className="retail-review-prompt">
                <span>{index + 1}</span>
                <p>{prompt}</p>
              </div>
            ))}
          </div>
        </details>

        {activeNode.id === "marketBrief" ? <RetailMarketSituationBoard context={marketContext} variant="compact" /> : null}

        <RetailReviewMaterialGrid
          activeNode={activeNode}
          materialValue={materialValue}
          onMaterialChange={onMaterialChange}
        />

        <div className="retail-node-footer">
          <div className={`retail-validation ${filledActiveCount > 0 ? "ok" : "error"}`}>
            {filledActiveCount > 0 ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
            <span>{filledActiveCount > 0 ? "当前节点已有复盘材料" : "当前节点尚未填写或导入材料"}</span>
          </div>
          <div className="retail-node-actions">
            <button type="button" data-action="view-review-records-inline" className="cockpit-secondary-action" onClick={onRecords}>
              训练记录
            </button>
            {nextNode ? (
              <button type="button" data-action="next-review-node" className="cockpit-primary-action" onClick={() => setActiveNodeId(nextNode.id)}>
                下一节点
                <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" data-action="save-review-record-inline" className="cockpit-primary-action" disabled={!canSave} onClick={onSave}>
                <Save size={15} />
                {saved ? "已保存" : "保存记录"}
              </button>
            )}
          </div>
        </div>
      </main>

      <RetailReviewOutputPanel
        activeNode={activeNode}
        saved={saved}
        roleMaterialCount={roleMaterials.length}
        materialSlotTotal={reviewStats.materialSlotTotal}
        progressPercent={reviewStats.progressPercent}
        coveredNodeCount={reviewStats.coveredNodeCount}
        nodeCount={reviewStats.nodeCount}
        filledActiveCount={filledActiveCount}
        canSave={canSave}
        onImport={importMaterial}
        onExport={exportMaterials}
        onSave={onSave}
        onRecords={onRecords}
        onHome={onHome}
      />
    </section>
  );
}
