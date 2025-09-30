'use client'

import { useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { FilterConfig } from '@/components/data-table/types';
import { useStockAdjustmentTable } from '@/hooks/inventory/use-stock-adjustment-table';
import { createStockAdjustmentColumns } from './columns/stock-adjustment-table-columns';
import { RefreshCw } from 'lucide-react';

interface StockAdjustmentTableProps {
  refreshKey?: number;
}

export const StockAdjustmentTable: React.FC<StockAdjustmentTableProps> = ({
  refreshKey = 0,
}) => {
  const {
    data,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    onPageChange,
    onPageSizeChange,
    onFiltersChange,
  } = useStockAdjustmentTable(refreshKey);

  const columns = createStockAdjustmentColumns();

  const filters: FilterConfig[] = [
    {
      key: "inventoryItemId",
      label: "Product",
      type: "custom-selector",
      placeholder: "All Products",
    },
    {
      key: "userId",
      label: "User",
      type: "custom-selector",
      placeholder: "All Users",
    },
    {
      key: "dateRange",
      label: "Date Range",
      type: "date-range",
      placeholder: "Select date range",
    },
  ];

  const emptyState = {
    title: "No stock adjustments found",
    description: "No stock adjustment records match your current filters.",
    icon: <RefreshCw className="h-12 w-12 text-muted-foreground" />,
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Stock Adjustments
          </h3>
          <p className="text-muted-foreground">
            {error.message || "Failed to load stock adjustment records"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      totalCount={totalCount}
      loading={loading}
      filters={filters}
      emptyState={emptyState}
      enableSorting={true}
      enableSelection={false}
      enablePagination={true}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onFiltersChange={onFiltersChange}
    />
  );
};