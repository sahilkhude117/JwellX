import { api } from "@/lib/api";
import { 
    GrowwApiResponse,
    HistoricalGoldData,
    HistoricalSilverData,
    MetalRatesFilters 
} from "@/lib/types/settings/metal-rates";

export const metalRatesApi = {
    // get current gold rates and trends from grow api
    getCurrentGoldRates: () => 
        api.get<GrowwApiResponse>(`/v1/metal-rates/current-gold`),

    // get historical gold data
    getHistoricalGoldData: (city: string = 'delhi', days: number = 30) =>
        api.get<HistoricalGoldData[]>(`/v1/metal-rates/historical-gold?city=${city}&days=${days}`),

    getHistoricalSilverData: (city: string = 'delhi', days: number = 30) => 
        api.get<HistoricalSilverData[]>(`/v1/metal-rates/historical-silver?city=${city}&days=${days}`),

    getFilteredMetalRates: (filters: MetalRatesFilters) =>
        api.get(`/v1/metal-rates/filtered`, { params: filters }),
};