import { useQuery } from "@tanstack/react-query";
import { metalRatesApi } from "@/lib/api/settings/metal-rates";

export const useCurrentGoldRates = () => {
    return useQuery({
        queryKey: ['current-gold-rates'],
        queryFn: metalRatesApi.getCurrentGoldRates,
        staleTime: 24 * 60 * 60 * 1000, // 24 hrs
        refetchInterval: 24 * 60 * 60 * 1000, // 24 hrs
        refetchOnWindowFocus: true,
    });
};


export const useHistoricalSilverData = (city: string = 'delhi') => {
  return useQuery({
    queryKey: ['historical-silver', city],
    queryFn: () => metalRatesApi.getHistoricalSilverData(city),
    staleTime: 24 * 60 * 60 * 1000, // 24 hrs
    refetchOnWindowFocus: true,
    enabled: !!city,
  });
};


export const useCurrentSilverData = (city: string = 'delhi') => {
  return useQuery({
    queryKey: ['current-silver', city],
    queryFn: async () => {
      const data = await metalRatesApi.getHistoricalSilverData(city);
      return data[0]; // Return only the first (most recent) entry
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hrs
    refetchOnWindowFocus: true,
    enabled: !!city,
  });
};