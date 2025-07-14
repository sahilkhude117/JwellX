// components/metal-rates/TopCitiesTable.tsx
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { TopCityGoldRate } from '@/lib/types/settings/metal-rates';
import { formatPrice,formatChange, formatPercentage, getChangeColorClass } from '@/lib/utils/metal-rates';

interface TopCitiesTableProps {
  data: TopCityGoldRate[];
  isLoading?: boolean;
  error?: Error | null;
}

export const TopCitiesTable: React.FC<TopCitiesTableProps> = ({
  data,
  isLoading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(city =>
    city.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <p>Error loading top cities data: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <TopCitiesTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-left'>City</TableHead>
              <TableHead className='text-right'>22K Gold</TableHead>
              <TableHead className='text-right'>24K Gold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No cities found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((city, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-left">
                    {city.displayName}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div>
                      <div className="font-medium">{formatPrice(city.gold22k.price)}</div>
                      <div className={`text-sm ${getChangeColorClass(city.gold22k.change)}`}>
                        {formatChange(city.gold22k.change)} ({formatPercentage(city.gold22k.changePercentage)})
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div>
                      <div className="font-medium">{formatPrice(city.gold24k.price)}</div>
                      <div className={`text-sm ${getChangeColorClass(city.gold24k.change)}`}>
                        {formatChange(city.gold24k.change)} ({formatPercentage(city.gold24k.changePercentage)})
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const TopCitiesTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search city..."
          disabled
          className="pl-10"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>22K Gold</TableHead>
              <TableHead>24K Gold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};