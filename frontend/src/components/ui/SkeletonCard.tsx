interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function EventCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0ms' }}>
      {/* Banner */}
      <div className="skeleton h-32 rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        {/* Title */}
        <div className="skeleton h-5 w-3/4" />
        {/* Meta */}
        <div className="flex gap-3">
          <div className="skeleton h-3.5 w-24" />
          <div className="skeleton h-3.5 w-28" />
        </div>
        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-5/6" />
        </div>
        {/* Bar */}
        <div className="skeleton h-1.5 w-full mt-2" />
        <div className="flex justify-between">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
