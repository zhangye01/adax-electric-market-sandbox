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
import {
  getAdaxNavStatus,
  getAdaxWorkspaceLabel,
  shouldShowAdaxOutputNav,
  type AdaxNavigationStatus
} from "../../domain/adaxNavigation";
import type { AdaxPageId, AdaxTrainingMode } from "../../types";
import { Badge } from "../Badge";
import { MarketClearingMark } from "./MarketClearingMark";

interface AppSidebarProps {
  currentPage: AdaxPageId;
  mode: AdaxTrainingMode | null;
  collapsed: boolean;
  canNavigate: (page: AdaxPageId) => boolean;
  onNavigate: (page: AdaxPageId) => void;
  onToggleCollapsed: () => void;
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

export function AppSidebar({
  currentPage,
  mode,
  collapsed,
  canNavigate,
  onNavigate,
  onToggleCollapsed
}: AppSidebarProps) {
  const trainingItems = trainingNav.map((item) =>
    item.page === "strategy" ? { ...item, label: getAdaxWorkspaceLabel(mode) } : item
  );

  function getStatus(item: NavItem) {
    return getAdaxNavStatus({
      item,
      currentPage,
      mode,
      canNavigate
    });
  }

  function handleNavClick(item: NavItem) {
    if (getStatus(item) === "locked") return;
    onNavigate(item.page);
  }

  return (
    <aside className="app-sidebar" aria-label="主导航">
      <button
        className="sidebar-collapse-button"
        type="button"
        aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        aria-expanded={!collapsed}
        onClick={onToggleCollapsed}
      >
        {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
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
        <NavSection title="产品入口" items={productNav} getStatus={getStatus} onClick={handleNavClick} collapsed={collapsed} />
        <NavSection title="本轮训练" items={trainingItems} getStatus={getStatus} onClick={handleNavClick} collapsed={collapsed} />
        {shouldShowAdaxOutputNav(mode) ? (
          <NavSection title="执行输出" items={outputNav} getStatus={getStatus} onClick={handleNavClick} collapsed={collapsed} />
        ) : null}
        <NavSection title="记录" items={recordNav} getStatus={getStatus} onClick={handleNavClick} collapsed={collapsed} />
      </nav>

      <div className="sidebar-footer-note">
        <span>训练级工具</span>
        <p>虚拟省级市场，不用于真实交易申报。</p>
      </div>
    </aside>
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
