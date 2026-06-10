import { BookOpen, CheckCircle2 } from "lucide-react";
import { Badge } from "../Badge";
import { placeholderForRetailReviewMaterial, retailReviewMaterialTypes } from "../../data/retailReviewMaterials";
import type { RetailTrainingNode } from "../../data/retailTrainingNodes";
import type { UserMaterial } from "../../types";

interface RetailReviewMaterialGridProps {
  activeNode: RetailTrainingNode;
  materialValue: (type: UserMaterial["materialType"]) => string;
  onMaterialChange: (node: RetailTrainingNode, materialType: UserMaterial["materialType"], content: string) => void;
}

export function RetailReviewMaterialGrid({
  activeNode,
  materialValue,
  onMaterialChange
}: RetailReviewMaterialGridProps) {
  return (
    <div className="retail-review-material-grid">
      {retailReviewMaterialTypes.map((type) => {
        const value = materialValue(type);
        const filled = value.trim().length > 0;
        return (
          <label key={type} className={`retail-review-material-card ${filled ? "filled" : ""}`}>
            <span>
              {filled ? <CheckCircle2 size={15} /> : <BookOpen size={15} />}
              <strong>{type}</strong>
              <Badge tone={filled ? "green" : "slate"}>{filled ? `${value.trim().length} 字` : "待填写"}</Badge>
            </span>
            <textarea
              aria-label={`${activeNode.title}-${type}`}
              data-material-node={activeNode.id}
              data-material-type={type}
              value={value}
              placeholder={placeholderForRetailReviewMaterial(type)}
              onChange={(event) => onMaterialChange(activeNode, type, event.target.value)}
            />
          </label>
        );
      })}
    </div>
  );
}
