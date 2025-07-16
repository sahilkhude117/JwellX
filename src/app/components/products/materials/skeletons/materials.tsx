import { Skeleton } from "@/components/ui/skeleton";

export function MaterialsSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  const cls = viewMode === "grid"
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    : "space-y-2";
  return (
    <div className={cls}>
      {[...Array(10)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export const GemstonesSkeleton = MaterialsSkeleton;