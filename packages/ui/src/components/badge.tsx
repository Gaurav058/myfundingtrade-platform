import { cn } from "../lib/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "gold" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" && "bg-slate-800 text-slate-300",
        variant === "brand" &&
          "border border-green-500/20 bg-green-500/10 text-green-400",
        variant === "gold" &&
          "border border-amber-500/20 bg-amber-500/10 text-amber-400",
        variant === "outline" && "border border-slate-700 text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type { BadgeProps };
