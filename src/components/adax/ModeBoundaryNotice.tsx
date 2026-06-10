import { GitBranch } from "lucide-react";
import { getAdaxModeBoundary, type AdaxModeSurface } from "../../domain/adaxModeBoundary";
import { StatusNotice } from "./StatusNotice";

interface ModeBoundaryNoticeProps {
  surface: AdaxModeSurface;
}

export function ModeBoundaryNotice({ surface }: ModeBoundaryNoticeProps) {
  const boundary = getAdaxModeBoundary(surface);

  return (
    <StatusNotice tone="info" title={boundary.title} icon={<GitBranch size={17} />}>
      <p>{boundary.purpose}</p>
      <p>{boundary.primaryOutput}；{boundary.mustNot.join("；")}。</p>
    </StatusNotice>
  );
}
