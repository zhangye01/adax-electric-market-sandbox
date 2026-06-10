import type { ReactNode } from "react";

interface CockpitStatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  detail?: string;
  tone?: "neutral" | "good" | "warn" | "risk";
}

export function CockpitStat({ label, value, unit, detail, tone = "neutral" }: CockpitStatProps) {
  return (
    <div className={`cockpit-stat ${tone}`}>
      <p>{label}</p>
      <strong>
        {value}
        {unit ? <span>{unit}</span> : null}
      </strong>
      {detail ? <em>{detail}</em> : null}
    </div>
  );
}
