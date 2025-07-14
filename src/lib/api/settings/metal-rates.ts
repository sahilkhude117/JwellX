import { api } from "@/lib/api";
import { 
    GrowwApiResponse,
    SilverData
} from "@/lib/types/settings/metal-rates";

export const metalRatesApi = {
    // get current gold rates and trends from grow api
    getCurrentGoldRates: () => 
        api.get<GrowwApiResponse>(`/v1/metal-rates/current-gold`),

    getHistoricalSilverData: (city: string = 'delhi') => 
        api.get<SilverData[]>(`/v1/metal-rates/historical-silver?city=${city}`),

};