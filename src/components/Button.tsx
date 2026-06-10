import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-800 text-white shadow-sm hover:bg-brand-900 focus-visible:outline-brand-600 disabled:bg-slate-300",
  secondary:
    "border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-brand-600 disabled:text-slate-400",
  ghost: "text-slate-700 hover:bg-brand-50 focus-visible:outline-brand-600 disabled:text-slate-400",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:outline-rose-500 disabled:text-rose-300"
};

export function Button({ children, className = "", variant = "primary", icon, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
