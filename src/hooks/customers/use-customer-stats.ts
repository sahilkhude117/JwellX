import { useState, useMemo } from 'react';
import { DollarSign, Users, UserPlus, Repeat } from 'lucide-react';
import {
  CustomerStat,
  CustomerStatsApiResponse,
} from '@/lib/types/customers/customers';
import { CustomTimePeriod, TimePeriod, StatsResponse, PredefinedTimePeriod, StatsHookReturn } from '@/lib/types/stats';
import { useCustomerStats } from './use-customers';
import { calculateTrend } from '@/lib/utils/stats';
import { convertTimePeriodToApiParams, getAvailableTimePeriods } from '@/lib/utils/stats';

// Transform API response to component format
const transformApiResponse = (
  apiData: CustomerStatsApiResponse, 
  timePeriod: TimePeriod
): StatsResponse<CustomerStat> => {
  const stats: CustomerStat[] = [
    {
      id: 'total-customers',
      type: 'total-customers',
      title: 'Total Customers',
      description: 'All registered customers',
      value: apiData.totalCustomers.current,
      icon: Users,
      unit: { suffix: ' customers' },
      isValueApprox: false,
      showGraph: true,
      trend: calculateTrend(apiData.totalCustomers.chartData),
      chartData: apiData.totalCustomers.chartData || [],
      timePeriod
    },
    {
      id: 'new-customers',
      type: 'new-customers',
      title: 'New Customers',
      description: 'Customers added in current period',
      value: apiData.newCustomers.current,
      icon: UserPlus,
      unit: { suffix: ' new' },
      isValueApprox: false,
      showGraph: true,
      trend: calculateTrend(apiData.newCustomers.chartData),
      chartData: apiData.newCustomers.chartData || [],
      timePeriod
    },
    {
      id: 'total-spend',
      type: 'total-spend',
      title: 'Total Spend',
      description: 'Total amount spent by all customers',
      value: apiData.totalSpend.current,
      icon: DollarSign,
      unit: { prefix: '₹' },
      isValueApprox: true,
      showGraph: true,
      trend: calculateTrend(apiData.totalSpend.chartData || []),
      chartData: apiData.totalSpend.chartData || [],
      timePeriod
    },
    {
      id: 'repeat-customers',
      type: 'repeat-customers',
      title: 'Repeat Customers',
      description: 'Customers with multiple purchases',
      value: apiData.repeatCustomers.current,
      icon: Repeat,
      unit: { suffix: ' repeat' },
      isValueApprox: false,
      showGraph: true,
      trend: calculateTrend(apiData.repeatCustomers.chartData),
      chartData: apiData.repeatCustomers.chartData || [],
      timePeriod
    }
  ];

  return {
    stats,
    lastUpdated: typeof apiData.lastUpdated === 'string' 
      ? apiData.lastUpdated 
      : apiData.lastUpdated.toISOString(),
    timePeriod,
    shopCreatedAt: typeof apiData.shopCreatedAt === 'string' 
      ? apiData.shopCreatedAt 
      : apiData.shopCreatedAt.toISOString()
  };
};

export interface CustomerStatsHookReturn extends StatsHookReturn<CustomerStat> {}

export const useCustomerStatsHook = (): CustomerStatsHookReturn => {
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
  } = useCustomerStats(apiParams);

  // Transform error to string
  const error = queryError ? queryError.message : null;

  // Transform API data to component format
  const data = apiData ? transformApiResponse(apiData, timePeriod) : null;
  
  // Get shop creation date from API response
  const shopCreatedAt = useMemo(() => {
    return data?.shopCreatedAt ? new Date(data.shopCreatedAt) : null;
  }, [data?.shopCreatedAt]);

  // Get available time periods based on shop age
  const availableTimePeriods = useMemo(() => {
    return getAvailableTimePeriods(shopCreatedAt || undefined);
  }, [shopCreatedAt]);

  // Add custom time period
  const addCustomTimePeriod = (period: CustomTimePeriod) => {
    // Check if a period with this label already exists
    const exists = customTimePeriods.some(p => p.label === period.label);
    if (!exists) {
      setCustomTimePeriods(prev => [...prev, period]);
    }
  };

  // Remove custom time period
  const removeCustomTimePeriod = (periodId: string) => {
    setCustomTimePeriods(prev => prev.filter(p => p.label !== periodId));
    
    // If the current period is being removed, switch to month
    if (typeof timePeriod !== 'string' && timePeriod.label === periodId) {
      setTimePeriod('month');
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    timePeriod,
    setTimePeriod,
    availableTimePeriods,
    addCustomTimePeriod,
    removeCustomTimePeriod,
    shopCreatedAt
  };
};