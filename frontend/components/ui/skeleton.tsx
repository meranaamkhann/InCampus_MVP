import { cn } from "@/lib/utils";

/** Shimmering placeholder block - used while data is loading. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "glass animate-pulse rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export function CardSkeletonGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-44" />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}
