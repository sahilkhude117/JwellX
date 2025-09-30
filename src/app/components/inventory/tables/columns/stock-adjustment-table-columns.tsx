'use client'

import { ColumnDef } from '@tanstack/react-table';
import { StockAdjustment } from '@/lib/types/inventory/inventory';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const createStockAdjustmentColumns = (): ColumnDef<StockAdjustment>[] => [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="space-y-1">
          <div className="font-medium">
            {format(date, 'MMM dd, yyyy')}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(date, 'HH:mm:ss')}
          </div>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: 'inventoryItem.name',
    header: 'Product',
    cell: ({ row }) => {
      const item = row.original.inventoryItem;
      return (
        <div className="space-y-1">
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">
            SKU: {item.sku}
          </div>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: 'adjustedBy.name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original.adjustedBy;
      return (
        <div className="font-medium">
          {user.name}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: 'adjustment',
    header: 'Adjustment',
    cell: ({ row }) => {
      const adjustment = row.original.adjustment;
      const isPositive = adjustment > 0;
      
      return (
        <div className="flex items-center space-x-2">
          <Badge
            variant={isPositive ? 'default' : 'destructive'}
            className={isPositive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
          >
            {isPositive ? '+' : ''}{adjustment}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {isPositive ? 'Added' : 'Removed'}
          </span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => {
      const reason = row.original.reason;
      
      return (
        <div className="max-w-[300px]">
          <div
            className="truncate"
            title={reason}
          >
            {reason}
          </div>
        </div>
      );
    },
    size: 300,
  },
];