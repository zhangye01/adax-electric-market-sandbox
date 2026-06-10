import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface StatusNoticeProps {
  tone?: "success" | "warning" | "danger" | "info";
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
}

export function StatusNotice({ tone = "info", title, children, icon }: StatusNoticeProps) {
  const defaultIcon =
    tone === "success" ? <CheckCircle2 size={17} /> : tone === "info" ? <ShieldCheck size={17} /> : <AlertTriangle size={17} />;

  return (
    <div className={`status-notice ${tone}`}>
      <div className="status-notice-icon">{icon ?? defaultIcon}</div>
      <div className="min-w-0">
        <p className="status-notice-title">{title}</p>
        {children ? <div className="status-notice-body">{children}</div> : null}
      </div>
    </div>
  );
}
