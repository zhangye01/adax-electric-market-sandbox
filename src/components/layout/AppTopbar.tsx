import { getAdaxFlowContext, getAdaxPageMeta, getAdaxTopbarBadge } from "../../domain/adaxNavigation";
import type { AdaxPageId, AdaxTrainingMode } from "../../types";
import { Badge } from "../Badge";

interface AppTopbarProps {
  currentPage: AdaxPageId;
  mode: AdaxTrainingMode | null;
}

export function AppTopbar({ currentPage, mode }: AppTopbarProps) {
  const pageMeta = getAdaxPageMeta(currentPage, mode);
  const flowContext = getAdaxFlowContext(currentPage, mode);
  const topbarBadge = getAdaxTopbarBadge(currentPage, mode);

  return (
    <header className="app-topbar">
      <div className="app-topbar-main">
        <p className="app-pathline">
          {pageMeta.section} / {pageMeta.title}
        </p>
        <h1>{pageMeta.title}</h1>
        <div className="app-flow-context" aria-label="当前训练上下文">
          {flowContext.items.map((item) => (
            <span key={`${item.label}-${item.value}`}>
              <em>{item.label}</em>
              <strong>{item.value}</strong>
            </span>
          ))}
        </div>
      </div>
      <div className="app-topbar-status">
        <Badge tone={topbarBadge.tone}>{topbarBadge.label}</Badge>
        <span className="app-next-action">下一步：{flowContext.nextAction}</span>
      </div>
    </header>
  );
}
