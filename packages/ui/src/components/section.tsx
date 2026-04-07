import { cn } from "../lib/cn";
import type { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div";
}

export function Section({
  className,
  as: Comp = "section",
  children,
  ...props
}: SectionProps) {
  return (
    <Comp className={cn("py-20 md:py-28", className)} {...props}>
      <div className="section-container">{children}</div>
    </Comp>
  );
}

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-14",
        align === "center" && "mx-auto max-w-2xl text-center",
        align === "left" && "max-w-3xl",
        className
      )}
      {...props}
    >
      {label && (
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-green-400">
          {label}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-slate-400 md:text-lg">{description}</p>
      )}
    </div>
  );
}
