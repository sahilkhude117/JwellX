
import { useState, useCallback, useMemo } from 'react';
import { Package, DollarSign, Weight, AlertTriangle } from 'lucide-react';
import { useInventoryStats } from './use-inventory';
import { 
  StatsResponse, 
  TimePeriod, 
  CustomTimePeriod,
  PredefinedTimePeriod 
} from "@/lib/types/stats";
import { 
  calculateTrend, 
  convertTimePeriodToApiParams,
  getAvailableTimePeriods
} from '@/lib/utils/stats';
import { InventoryStat, InventoryStatsApiResponse, InventoryStatsHookReturn } from '@/lib/types/inventory/inventory-stats';

// Transform API response to component format
const transformApiResponse = (
  apiData: InventoryStatsApiResponse, 
  timePeriod: TimePeriod
): StatsResponse<InventoryStat> => {
  const stats: InventoryStat[] = [
    {
      id: 'total-items',
      type: 'total-items',
      title: 'Total Items',
      description: 'Unique product designs in stock',
      value: apiData.totalItems.current,
      icon: Package,
      unit: { suffix: ' items' },
      isValueApprox: false,
      showGraph: true,
      trend: calculateTrend(apiData.totalItems.chartData),
      chartData: apiData.totalItems.chartData || [],
      timePeriod
    },
    {
      id: 'total-value',
      type: 'total-value',
      title: 'Total Value',
      description: 'Total inventory worth (quantity × price)',
      value: apiData.totalValue.current, // Already converted from paise to rupees in API
      icon: DollarSign,
      unit: { prefix: '₹' },
      isValueApprox: true,
      showGraph: true,
      trend: calculateTrend(apiData.totalValue.chartData || []),
      chartData: apiData.totalValue.chartData || [],
      timePeriod
    },
    {
      id: 'total-weight',
      type: 'total-weight',
      title: 'Total Weight',
      description: 'Total metal weight (quantity × weight)',
      value: apiData.totalWeight.current, // Already converted from mg to grams in API
      icon: Weight,
      unit: { suffix: ' g' }, // Changed from kg to grams
      isValueApprox: false,
      showGraph: true,
      trend: calculateTrend(apiData.totalWeight.chartData || []),
      chartData: apiData.totalWeight.chartData || [],
      timePeriod
    },
    {
      id: 'low-stock',
      type: 'low-stock',
      title: 'Low Stock Items',
      description: 'Products with ≤5 pieces remaining',
      value: apiData.lowStockItems.current,
      icon: AlertTriangle,
      unit: { suffix: ' items' },
      isValueApprox: false,
      showGraph: true,
      trend: calculateTrend(apiData.lowStockItems.chartData),
      chartData: apiData.lowStockItems.chartData || [],
      timePeriod
    }
  ];

  return {
    stats,
    lastUpdated: apiData.lastUpdated,
    timePeriod,
    shopCreatedAt: apiData.shopCreatedAt
  };
};

export const useInventoryStatsHook = (): InventoryStatsHookReturn => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [customTimePeriods, setCustomTimePeriods] = useState<CustomTimePeriod[]>([]);

  // Convert TimePeriod to API params
  const apiParams = convertTimePeriodToApiParams(timePeriod);

  // Use TanStack Query hook
  const {
    data: apiData,
    isLoading,
    error: queryError,
    refetch,
    isRefetching
  } = useInventoryStats(apiParams);

  // Transform error to string
  const error = queryError ? queryError.message : null;

  // Transform API data to component format
  const data = apiData ? transformApiResponse(apiData, timePeriod) : null;
  
  // Get shop creation date from API response
  const shopCreatedAt = useMemo(() => {
    return data?.shopCreatedAt ? new Date(data.shopCreatedAt) : null;
  }, [data?.shopCreatedAt]);

  // Get available time periods based on shop age
  const availableTimePeriods: TimePeriod[] = useMemo(() => {
    const basePeriods = getAvailableTimePeriods(shopCreatedAt || undefined);
    return [...basePeriods, ...customTimePeriods];
  }, [shopCreatedAt, customTimePeriods]);

  const handleSetTimePeriod = useCallback((newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod);
  }, []);

  const addCustomTimePeriod = useCallback((period: CustomTimePeriod) => {
    setCustomTimePeriods(prev => {
      // Check if period already exists
      const exists = prev.some(p => 
        p.startDate.getTime() === period.startDate.getTime() && 
        p.endDate.getTime() === period.endDate.getTime()
      );
      
      if (exists) return prev;
      
      return [...prev, period];
    });
  }, []);

  const removeCustomTimePeriod = useCallback((periodId: string) => {
    setCustomTimePeriods(prev => 
      prev.filter(p => p.label !== periodId)
    );
    
    // If the removed period was currently selected, switch to month
    if (typeof timePeriod !== 'string' && timePeriod.label === periodId) {
      handleSetTimePeriod('month');
    }
  }, [timePeriod, handleSetTimePeriod]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    timePeriod,
    setTimePeriod: handleSetTimePeriod,
    availableTimePeriods,
    addCustomTimePeriod,
    removeCustomTimePeriod,
    shopCreatedAt
  };
};
