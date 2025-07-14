// components/metal-rates/HistoricalDataTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { HistoricalDataRow } from '@/lib/types/settings/metal-rates';
import { formatPrice, formatChange, formatPercentage, getChangeColorClass, formatDate} from '@/lib/utils/metal-rates';

interface HistoricalDataTableProps {
  data: HistoricalDataRow[];
  isLoading?: boolean;
  error?: Error | null;
}

export const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({
  data,
  isLoading = false,
  error = null,
}) => {
  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <p>Error loading historical data: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <HistoricalDataTableSkeleton />;
  }

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="text-left">Day</TableHead>
                <TableHead className="text-right">22K Pure Gold</TableHead>
                <TableHead className="text-right">24K Pure Gold</TableHead>
                <TableHead className="text-right">Silver</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-left">
                {formatDate(row.date)}
              </TableCell>
              <TableCell className='text-right'>
                <div>
                  <div className="font-medium">{formatPrice(row.gold22k.price)}</div>
                  <div className={`text-sm ${getChangeColorClass(row.gold22k.change)}`}>
                    {formatChange(row.gold22k.change)} ({formatPercentage(row.gold22k.changePercentage)})
                  </div>
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <div>
                  <div className="font-medium">{formatPrice(row.gold24k.price)}</div>
                  <div className={`text-sm ${getChangeColorClass(row.gold24k.change)}`}>
                    {formatChange(row.gold24k.change)} ({formatPercentage(row.gold24k.changePercentage)})
                  </div>
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <div>
                  <div className="font-medium">{formatPrice(row.silver.price)}</div>
                  <div className={`text-sm ${getChangeColorClass(row.silver.change)}`}>
                    {formatChange(row.silver.change)} ({formatPercentage(row.silver.changePercentage)})
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const HistoricalDataTableSkeleton: React.FC = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>22K Pure Gold</TableHead>
            <TableHead>24K Pure Gold</TableHead>
            <TableHead>Silver</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};