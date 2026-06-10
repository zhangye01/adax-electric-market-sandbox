import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="report-band mb-6 flex items-start justify-between gap-8 p-6">
      <div>
        {eyebrow ? <p className="section-kicker mb-3">{eyebrow}</p> : null}
        <h1 className="text-[30px] font-bold leading-tight tracking-normal text-slate-100">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
