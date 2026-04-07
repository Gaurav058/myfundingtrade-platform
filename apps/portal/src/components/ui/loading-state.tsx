import { cn } from "@myfundingtrade/ui";

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[var(--color-bg-surface-hover)]",
        className,
      )}
    />
  );
}

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[104px]" />
      ))}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <LoadingCards />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export { Skeleton };
