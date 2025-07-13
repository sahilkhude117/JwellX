import { useQuery } from "@tanstack/react-query";
import { metalRatesApi } from "@/lib/api/settings/metal-rates";
import { MetalRatesFilters } from "@/lib/types/settings/metal-rates";

export const useCurrentGoldRates = () => {
    return useQuery({
        queryKey: ['current-gold-rates'],
        queryFn: metalRatesApi.getCurrentGoldRates,
        staleTime: 24 * 60 * 60 * 1000, // 24 hrs
        refetchInterval: 24 * 60 * 60 * 1000, // 24 hrs
        refetchOnWindowFocus: true,
    });
};

export const useHistoricalGoldData = (city: string = 'delhi', days: number = 30) => {
    return useQuery({
        queryKey: ['historical-gold', city, days],
        queryFn: () => metalRatesApi.getHistoricalGoldData(city, days),
        staleTime: 24 * 60 * 60 * 1000, // 24 hrs
        refetchOnWindowFocus: true,
        enabled: !!city && !!days,
    });
};

export const useHistoricalSilverData = (city: string = 'delhi', days: number = 30) => {
  return useQuery({
    queryKey: ['historical-silver', city, days],
    queryFn: () => metalRatesApi.getHistoricalSilverData(city, days),
    staleTime: 24 * 60 * 60 * 1000, // 24 hrs
    refetchOnWindowFocus: true,
    enabled: !!city && !!days,
  });
};

export const useFilteredMetalRates = (filters: MetalRatesFilters) => {
  return useQuery({
    queryKey: ['filtered-metal-rates', filters],
    queryFn: () => metalRatesApi.getFilteredMetalRates(filters),
    staleTime: 24 * 60 * 60 * 1000, // 24 hrs
    refetchOnWindowFocus: false,
    enabled: !!(filters.city || filters.metal),
  });
};