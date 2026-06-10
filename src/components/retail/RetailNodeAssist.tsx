import { HelpCircle, Upload } from "lucide-react";
import { getRetailWorkbenchAssist } from "../../domain/retailWorkbenchAssist";
import type { AdaxTrainingMode } from "../../types";

interface RetailNodeAssistProps {
  mode: AdaxTrainingMode;
  detail: string;
  activeNodeTitle?: string;
  onImport?: (file: File | undefined) => Promise<void>;
}

export function RetailNodeAssist({
  mode,
  detail,
  activeNodeTitle,
  onImport
}: RetailNodeAssistProps) {
  const assist = getRetailWorkbenchAssist(mode);

  if (mode === "review") {
    return (
      <label className={`retail-node-assist ${assist.modeClass}`} tabIndex={0} aria-label={`导入${activeNodeTitle ?? "当前节点"}培训材料`}>
        <Upload size={16} />
        <span>{assist.label}</span>
        <em>{detail}</em>
        <input
          type="file"
          accept=".txt,.md,.json,text/plain,application/json,text/markdown"
          onChange={async (event) => {
            await onImport?.(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
    );
  }

  return (
    <span className={`retail-node-assist ${assist.modeClass}`} tabIndex={0}>
      <HelpCircle size={16} />
      <span>{assist.label}</span>
      <em>{detail}</em>
    </span>
  );
}
