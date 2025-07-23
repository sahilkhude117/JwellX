import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductHeaderProps {
  totalCount: number;
  isLoading?: boolean;
}

export function ProductHeader({ totalCount, isLoading }: ProductHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        {isLoading ? (
          <Skeleton className="h-4 w-32 mt-1" />
        ) : (
          <span className="text-sm text-muted-foreground mt-1">
            Manage your jewelry inventory • <Badge variant="secondary">{totalCount} items</Badge>
          </span>
        )}
      </div>
    </div>
  );
}