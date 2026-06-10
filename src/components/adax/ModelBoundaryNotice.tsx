import { ShieldCheck } from "lucide-react";
import { adaxTrainingModelBoundary } from "../../domain/adaxModelBoundary";
import { StatusNotice } from "./StatusNotice";

interface ModelBoundaryNoticeProps {
  compact?: boolean;
}

export function ModelBoundaryNotice({ compact = false }: ModelBoundaryNoticeProps) {
  return (
    <StatusNotice
      tone="warning"
      title={compact ? "训练级结果" : adaxTrainingModelBoundary.title}
      icon={<ShieldCheck size={17} />}
    >
      <p>{compact ? adaxTrainingModelBoundary.restriction : adaxTrainingModelBoundary.summary}</p>
      {!compact ? <p>{adaxTrainingModelBoundary.restriction}</p> : null}
    </StatusNotice>
  );
}
