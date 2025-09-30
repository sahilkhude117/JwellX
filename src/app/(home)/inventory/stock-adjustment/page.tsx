'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useStockAdjustmentTable } from '@/hooks/inventory/use-stock-adjustment-table';
import { StockAdjustmentTable } from '@/app/components/inventory/tables/stock-adjustment-table';

export default function StockAdjustmentPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const {
    lastUpdated,
    refresh,
    loading,
    error,
  } = useStockAdjustmentTable(refreshKey);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refresh();
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error Loading Stock Adjustments
            </h3>
            <p className="text-muted-foreground mb-4">
              {error.message || "Failed to load stock adjustment records"}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
          <p className="text-muted-foreground mt-1">
            {lastUpdated && (
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <StockAdjustmentTable refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
