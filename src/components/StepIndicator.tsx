import { Check } from "lucide-react";
import type { AdaxTrainingMode, AdaxTrainingStep } from "../types";

interface StepIndicatorProps {
  current: AdaxTrainingStep;
  mode?: AdaxTrainingMode | null;
}

type StepItem = { id: AdaxTrainingStep; label: string };

const launchSteps: StepItem[] = [
  { id: "start", label: "模式确认" },
  { id: "scenario", label: "场景确认" },
  { id: "role", label: "主体确认" },
  { id: "strategy", label: "进入工作台" }
];

const executionSteps: StepItem[] = [
  { id: "start", label: "模式" },
  { id: "scenario", label: "场景" },
  { id: "role", label: "主体" },
  { id: "strategy", label: "工作台" },
  { id: "settlement", label: "结算" },
  { id: "review", label: "回看" }
];

const reviewSteps: StepItem[] = [
  { id: "start", label: "模式" },
  { id: "scenario", label: "场景" },
  { id: "role", label: "主体" },
  { id: "strategy", label: "复盘工作台" }
];

export function StepIndicator({ current, mode = null }: StepIndicatorProps) {
  const steps = mode === "review" ? reviewSteps : mode === "execution" ? executionSteps : launchSteps;
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <div className="card step-indicator mb-6 px-6 py-4">
      <div className="step-indicator-track">
        {steps.map((step, index) => {
          const active = index === currentIndex;
          const complete = index < currentIndex;

          return (
            <div key={step.id} className="step-indicator-item">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${
                    active
                      ? "border-cyan-400 bg-cyan-500 text-slate-950"
                      : complete
                        ? "border-teal-400 bg-teal-500 text-slate-950"
                        : "border-slate-600 bg-slate-900 text-slate-400"
                  }`}
                >
                  {complete ? <Check size={16} /> : index + 1}
                </span>
                <span className={`text-sm font-semibold ${active ? "text-cyan-200" : "text-slate-400"}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div className={`step-indicator-line ${complete ? "bg-teal-500" : "bg-slate-700"}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
