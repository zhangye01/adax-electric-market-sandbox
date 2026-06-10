import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  eyebrow?: string;
}

export function Panel({ title, subtitle, action, children, className = "", eyebrow }: PanelProps) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            {eyebrow ? <p className="section-kicker mb-2">{eyebrow}</p> : null}
            {title ? <h2 className="text-lg font-bold tracking-normal text-slate-100">{title}</h2> : null}
            {subtitle ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
