import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "blue" | "teal" | "slate" | "orange" | "green" | "red";
}

const toneClass = {
  blue: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
  teal: "border-teal-400/30 bg-teal-400/10 text-teal-100",
  slate: "border-slate-600 bg-slate-800 text-slate-200",
  orange: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  red: "border-rose-400/35 bg-rose-400/10 text-rose-100"
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
