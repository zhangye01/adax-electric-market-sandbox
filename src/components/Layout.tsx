import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { AdaxPageId, AdaxTrainingMode } from "../types";
import { AppSidebar } from "./layout/AppSidebar";
import { AppTopbar } from "./layout/AppTopbar";

interface LayoutProps {
  currentPage: AdaxPageId;
  mode?: AdaxTrainingMode | null;
  canNavigate?: (page: AdaxPageId) => boolean;
  onNavigate: (page: AdaxPageId) => void;
  children: ReactNode;
}

export function Layout({ currentPage, mode = null, canNavigate = () => true, onNavigate, children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => isCompactViewport());

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(max-width: 760px)");
    const collapseOnCompact = (matches: boolean) => {
      if (matches) setSidebarCollapsed(true);
    };

    collapseOnCompact(media.matches);

    if (media.addEventListener) {
      const listener = (event: MediaQueryListEvent) => collapseOnCompact(event.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    const legacyListener = (event: MediaQueryListEvent) => collapseOnCompact(event.matches);
    media.addListener(legacyListener);
    return () => media.removeListener(legacyListener);
  }, []);

  return (
    <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <AppSidebar
        currentPage={currentPage}
        mode={mode}
        collapsed={sidebarCollapsed}
        canNavigate={canNavigate}
        onNavigate={onNavigate}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      <div className="app-main-area">
        <AppTopbar currentPage={currentPage} mode={mode} />
        <main>{children}</main>
      </div>
    </div>
  );
}

function isCompactViewport() {
  return typeof window !== "undefined" && window.matchMedia?.("(max-width: 760px)").matches;
}
