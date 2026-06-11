import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-[var(--radius-card)] bg-[#ebe8e2]',
        className,
      )}
    />
  );
}

export function BeaconCardSkeleton() {
  return (
    <div className="min-w-[260px] shrink-0 rounded-[var(--radius-card)] border border-border overflow-hidden bg-surface">
      <Skeleton className="h-32 rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function VenueRowSkeleton() {
  return (
    <div className="flex gap-4 rounded-[var(--radius-card)] border border-border overflow-hidden bg-surface">
      <Skeleton className="w-28 h-28 shrink-0 rounded-none" />
      <div className="py-4 pr-4 flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
