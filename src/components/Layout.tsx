import {
  ClipboardList,
  Database,
  FileText,
  Home,
  Info,
  Library,
  ListChecks,
  NotebookTabs,
  PlayCircle,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAdaxFlowContext,
  getAdaxNavStatus,
  getAdaxPageMeta,
  getAdaxTopbarBadge,
  getAdaxWorkspaceLabel,
  shouldShowAdaxOutputNav,
  type AdaxNavigationStatus
} from "../domain/adaxNavigation";
import type { AdaxPageId, AdaxTrainingMode } from "../types";
import { Badge } from "./Badge";

interface LayoutProps {
  currentPage: AdaxPageId;
  mode?: AdaxTrainingMode | null;
  canNavigate?: (page: AdaxPageId) => boolean;
  onNavigate: (page: AdaxPageId) => void;
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  page: AdaxPageId;
  icon: LucideIcon;
  requiresMode?: boolean;
  executionOnly?: boolean;
}

const productNav: NavItem[] = [
  { label: "首页", page: "home", icon: Home },
  { label: "关于", page: "about", icon: Info }
];

const trainingNav: NavItem[] = [
  { label: "模式确认", page: "start", icon: PlayCircle },
  { label: "市场场景", page: "scenario", icon: Database, requiresMode: true },
  { label: "训练主体", page: "role", icon: ListChecks, requiresMode: true },
  { label: "交易工作台", page: "strategy", icon: Library, requiresMode: true }
];

const outputNav: NavItem[] = [
  { label: "结算结果", page: "settlement", icon: NotebookTabs, requiresMode: true, executionOnly: true },
  { label: "结果回看", page: "review", icon: FileText, requiresMode: true, executionOnly: true }
];

const recordNav: NavItem[] = [{ label: "训练记录", page: "records", icon: ClipboardList }];

export function Layout({ currentPage, mode = null, canNavigate = () => true, onNavigate, children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => isCompactViewport());
  const pageMeta = getAdaxPageMeta(currentPage, mode);
  const flowContext = getAdaxFlowContext(currentPage, mode);
  const trainingItems = trainingNav.map((item) =>
    item.page === "strategy" ? { ...item, label: getAdaxWorkspaceLabel(mode) } : item
  );
  const topbarBadge = getAdaxTopbarBadge(currentPage, mode);

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

  function isDisabled(item: NavItem) {
    return getStatus(item) === "locked";
  }

  function getStatus(item: NavItem) {
    return getAdaxNavStatus({
      item,
      currentPage,
      mode,
      canNavigate
    });
  }

  function handleNavClick(item: NavItem) {
    if (isDisabled(item)) return;
    onNavigate(item.page);
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="app-sidebar" aria-label="主导航">
        <button
          className="sidebar-collapse-button"
          type="button"
          aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          aria-expanded={!sidebarCollapsed}
          onClick={() => setSidebarCollapsed((value) => !value)}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>

        <button className="sidebar-brand" onClick={() => onNavigate("home")}>
          <span className="sidebar-brand-mark">
            <MarketClearingMark />
          </span>
          <span className="sidebar-brand-copy">
            <strong>ADAX</strong>
            <span>电力市场多主体交易实训沙盘</span>
          </span>
        </button>

        <div className="sidebar-mode-card">
          <span>当前模式</span>
          <Badge tone={mode === "execution" ? "green" : mode === "review" ? "orange" : "slate"}>
            {mode === "execution" ? "执行模式" : mode === "review" ? "复盘模式" : "待确认"}
          </Badge>
        </div>

        <nav className="sidebar-nav">
          <NavSection title="产品入口" items={productNav} getStatus={getStatus} onClick={handleNavClick} collapsed={sidebarCollapsed} />
          <NavSection title="本轮训练" items={trainingItems} getStatus={getStatus} onClick={handleNavClick} collapsed={sidebarCollapsed} />
          {shouldShowAdaxOutputNav(mode) ? (
            <NavSection title="执行输出" items={outputNav} getStatus={getStatus} onClick={handleNavClick} collapsed={sidebarCollapsed} />
          ) : null}
          <NavSection title="记录" items={recordNav} getStatus={getStatus} onClick={handleNavClick} collapsed={sidebarCollapsed} />
        </nav>

        <div className="sidebar-footer-note">
          <span>训练级工具</span>
          <p>虚拟省级市场，不用于真实交易申报。</p>
        </div>
      </aside>

      <div className="app-main-area">
        <header className="app-topbar">
          <div className="app-topbar-main">
            <p className="app-pathline">{pageMeta.section} / {pageMeta.title}</p>
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
        <main>{children}</main>
      </div>
    </div>
  );
}

function isCompactViewport() {
  return typeof window !== "undefined" && window.matchMedia?.("(max-width: 760px)").matches;
}

function MarketClearingMark() {
  return (
    <svg className="market-clearing-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path className="market-clearing-bar" d="M6 22H11V28H6Z" />
      <path className="market-clearing-bar" d="M14 18H19V28H14Z" />
      <path className="market-clearing-bar" d="M22 13H27V28H22Z" />
      <path className="market-clearing-trend" d="M5 19L10.5 14.5L15.5 17.5L21 12L25.5 8.5" />
      <path className="market-clearing-arrow" d="M24 6.5L29 7.5L27.5 12.5Z" />
    </svg>
  );
}

function NavSection({
  title,
  items,
  getStatus,
  onClick,
  collapsed
}: {
  title: string;
  items: NavItem[];
  getStatus: (item: NavItem) => AdaxNavigationStatus;
  onClick: (item: NavItem) => void;
  collapsed: boolean;
}) {
  return (
    <section className="sidebar-section">
      <h2>{title}</h2>
      <div className="sidebar-section-body">
        {items.map((item) => {
          const Icon = item.icon;
          const status = getStatus(item);
          return (
            <button
              key={item.page}
              className={`sidebar-nav-item ${status}`}
              disabled={status === "locked"}
              onClick={() => onClick(item)}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
            >
              <span className="sidebar-nav-main">
                <Icon size={16} />
                <span>{item.label}</span>
              </span>
              <span className={`sidebar-status ${status}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
