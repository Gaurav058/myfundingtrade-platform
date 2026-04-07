import { cn } from "@myfundingtrade/ui";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  variant?: "brand" | "danger" | "warning" | "info";
  className?: string;
}

const variantColors: Record<string, string> = {
  brand: "bg-[var(--color-brand)]",
  danger: "bg-[var(--color-danger)]",
  warning: "bg-[var(--color-warning)]",
  info: "bg-[var(--color-info)]",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  variant = "brand",
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="text-neutral-400">{label}</span>}
          {showValue && <span className="font-mono text-neutral-300">{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-full bg-[var(--color-bg-surface-hover)]",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", variantColors[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
