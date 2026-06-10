import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "blue" | "green" | "orange" | "red" | "slate";
}

const toneClass = {
  blue: "border-sky-900/70 bg-sky-950/35 text-sky-200",
  green: "border-emerald-900/70 bg-emerald-950/35 text-emerald-200",
  orange: "border-amber-900/70 bg-amber-950/35 text-amber-200",
  red: "border-rose-900/70 bg-rose-950/35 text-rose-200",
  slate: "border-slate-700 bg-slate-900/70 text-slate-300"
};

export function MetricCard({ label, value, detail, tone = "slate" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${toneClass[tone]}`}>
      <p className="text-xs font-semibold tracking-wide opacity-75">{label}</p>
      <div className="mt-2 text-[25px] font-bold leading-tight text-slate-100">{value}</div>
      {detail ? <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p> : null}
    </div>
  );
}
