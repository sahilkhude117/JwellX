// components/metal-rates/MetalRateCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, formatChange, formatPercentage, getChangeColorClass } from '@/lib/utils/metal-rates';
import { MetalRateCard } from '@/lib/types/settings/metal-rates';
import { Skeleton } from '@/components/ui/skeleton';

interface MetalRateCardProps {
  data: MetalRateCard;
}

export const MetalRateCardComponent: React.FC<MetalRateCardProps> = ({ data }) => {
  const changeColorClass = getChangeColorClass(data.change);

  return (
    <Card>
      <CardContent className="">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{data.title} / {data.unit}</h3>
              <p className="text-xs text-muted-foreground mt-1">{data.date}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatPrice(data.price)}</p>
              <div className={`text-sm font-medium ${changeColorClass}`}>
                <span>{formatChange(data.change)}</span>
                <span className="ml-1">({formatPercentage(data.changePercentage)})</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MetalRateCardSkeleton: React.FC = () => {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};