// src/app/settings/daily-metal-rates/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { MetalRateCardComponent, MetalRateCardSkeleton } from '@/app/components/settings/metal-rates/MetalRateCard';
import { CitySelector } from '@/app/components/settings/metal-rates/CitySelector';
import { UnitSelector } from '@/app/components/settings/metal-rates/UnitSelector';
import { GoldUnitSelector } from '@/app/components/settings/metal-rates/GoldUnitSelector';
import { HistoricalDataTable } from '@/app/components/settings/metal-rates/HistoricalRatesTable';
import { TopCitiesTable } from '@/app/components/settings/metal-rates/CityRatesTable';
import { useCurrentGoldRates, useCurrentSilverData, useHistoricalSilverData } from '@/hooks/settings/use-metal-rates';
import { 
  City, 
  Unit, 
  GoldUnit, 
  MetalRateCard,
  HistoricalDataRow,
  TopCityGoldRate
} from '@/lib/types/settings/metal-rates';
import { 
  formatPrice, 
  formatDate, 
  getCurrentDateTime, 
  getCityDisplayName,
  parsePrice, 
  parsePercentage,
  convertGoldPrice,
  convertSilverPrice,
  convertGoldPriceForTopCities,
  calculateChange,
  sortHistoricalData
} from '@/lib/utils/metal-rates';

export default function DailyMetalRatesPage() {
  const queryClient = useQueryClient();
  const [selectedCity, setSelectedCity] = useState<City>('delhi');
  const [historicalUnit, setHistoricalUnit] = useState<Unit>('10g');
  const [topCitiesUnit, setTopCitiesUnit] = useState<GoldUnit>('per_10_gram');

  const { 
    data: goldData, 
    isLoading: goldLoading, 
    error: goldError 
  } = useCurrentGoldRates();

  const { 
    data: silverData, 
    isLoading: silverLoading, 
    error: silverError 
  } = useHistoricalSilverData(selectedCity);

  const { 
    data: currentSilverData, 
    isLoading: currentSilverLoading, 
    error: currentSilverError 
  } = useCurrentSilverData(selectedCity);

  const { date: formattedDate, time: formattedTime } = getCurrentDateTime();

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['current-gold-rates'] });
    queryClient.invalidateQueries({ queryKey: ['historical-silver-rates'] });
    queryClient.invalidateQueries({ queryKey: ['current-silver-rates'] });
  };

  const isLoading = goldLoading || silverLoading || currentSilverLoading;

  // Generate today's metal rate cards
  const todaysRateCards = useMemo((): MetalRateCard[] => {
    const cards: MetalRateCard[] = [];
    
    if (goldData && goldData.physicalGoldRate) {
      const cityData = goldData.physicalGoldRate[selectedCity];
      if (cityData) {
        const gold24kPrice = parsePrice(String(cityData.price.TWENTY_FOUR)) * 10; // Convert to 10g
        const gold22kPrice = parsePrice(String(cityData.price.TWENTY_TWO)) * 10; // Convert to 10g
        const gold24kChange = parsePercentage(String(cityData.percentageChange.TWENTY_FOUR));
        const gold22kChange = parsePercentage(String(cityData.percentageChange.TWENTY_TWO));
        
        cards.push({
          title: '24K Gold',
          unit: '10gm',
          price: gold24kPrice,
          change: (gold24kPrice * gold24kChange) / 100,
          changePercentage: gold24kChange,
          date: formatDate(cityData.date || new Date().toISOString())
        });

        cards.push({
          title: '22K Gold',
          unit: '10gm',
          price: gold22kPrice,
          change: (gold22kPrice * gold22kChange) / 100,
          changePercentage: gold22kChange,
          date: formatDate(cityData.date || new Date().toISOString())
        });
      }
    }

    if (currentSilverData) {
      const silverRecord = currentSilverData;
      const silverPrice = parsePrice(String(silverRecord.price10g));
      const silverChange = parsePrice(String(silverRecord.change10g));
      const silverChangePercentage = silverChange / (silverPrice - silverChange) * 100;
      
      cards.push({
        title: 'Silver',
        unit: '10gm',
        price: silverPrice,
        change: silverChange,
        changePercentage: silverChangePercentage,
        date: formatDate(silverRecord.date)
      });
    }

    return cards;
  }, [goldData, currentSilverData, selectedCity]);

  // Generate historical data for table
  const historicalData = useMemo((): HistoricalDataRow[] => {
    if (!goldData || !silverData) return [];

    const cityDaySummary = goldData.daySummary[selectedCity];
    const sortedSilverData = sortHistoricalData([...silverData]);

    return sortedSilverData.map((silverRecord, index) => {
      const goldRecord = cityDaySummary?.[silverRecord.date];
      
      let gold22kPrice = 0;
      let gold24kPrice = 0;
      let gold22kChange = 0;
      let gold24kChange = 0;
      let gold22kChangePercentage = 0;
      let gold24kChangePercentage = 0;

      if (goldRecord) {
        const gold22kPricePerGram = parsePrice(String(goldRecord.price.TWENTY_TWO));
        const gold24kPricePerGram = parsePrice(String(goldRecord.price.TWENTY_FOUR));
        
        gold22kPrice = convertGoldPrice(gold22kPricePerGram, historicalUnit);
        gold24kPrice = convertGoldPrice(gold24kPricePerGram, historicalUnit);
        
        gold22kChangePercentage = parsePercentage(String(goldRecord.percentageChange.TWENTY_TWO));
        gold24kChangePercentage = parsePercentage(String(goldRecord.percentageChange.TWENTY_FOUR));
        
        gold22kChange = (gold22kPrice * gold22kChangePercentage) / 100;
        gold24kChange = (gold24kPrice * gold24kChangePercentage) / 100;
      }

      const silverPrice = convertSilverPrice(parsePrice(String(silverRecord.price10g)), historicalUnit);
      const silverChange = convertSilverPrice(parsePrice(String(silverRecord.change10g)), historicalUnit);
      const silverChangePercentage = silverChange / (silverPrice - silverChange) * 100;

      return {
        date: silverRecord.date,
        gold22k: {
          price: gold22kPrice,
          change: gold22kChange,
          changePercentage: gold22kChangePercentage
        },
        gold24k: {
          price: gold24kPrice,
          change: gold24kChange,
          changePercentage: gold24kChangePercentage
        },
        silver: {
          price: silverPrice,
          change: silverChange,
          changePercentage: silverChangePercentage
        }
      };
    });
  }, [goldData, silverData, selectedCity, historicalUnit]);


  // Generate top cities data
  const topCitiesData = useMemo((): TopCityGoldRate[] => {
    if (!goldData || !goldData.trendingCities) return [];

    return goldData.trendingCities.map(city => {
      const cityData = goldData.physicalGoldRate[city];
      if (!cityData) return null;

      const gold22kPricePerGram = parsePrice(String(cityData.price.TWENTY_TWO));
      const gold24kPricePerGram = parsePrice(String(cityData.price.TWENTY_FOUR));
      
      const gold22kPrice = convertGoldPriceForTopCities(gold22kPricePerGram, topCitiesUnit);
      const gold24kPrice = convertGoldPriceForTopCities(gold24kPricePerGram, topCitiesUnit);
      
      const gold22kChangePercentage = parsePercentage(String(cityData.percentageChange.TWENTY_TWO));
      const gold24kChangePercentage = parsePercentage(String(cityData.percentageChange.TWENTY_FOUR));
      
      const gold22kChange = (gold22kPrice * gold22kChangePercentage) / 100;
      const gold24kChange = (gold24kPrice * gold24kChangePercentage) / 100;

      return {
        city: city,
        displayName: getCityDisplayName(city),
        gold22k: {
          price: gold22kPrice,
          change: gold22kChange,
          changePercentage: gold22kChangePercentage
        },
        gold24k: {
          price: gold24kPrice,
          change: gold24kChange,
          changePercentage: gold24kChangePercentage
        }
      };
    }).slice(0,10).filter(Boolean) as TopCityGoldRate[]
    ;
  }, [goldData, topCitiesUnit]);

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="border rounded-lg bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Daily Metal Rates In {selectedCity === 'delhi' ? 'India' : getCityDisplayName(selectedCity)}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              View live market rates for precious metals. Last updated: {formattedDate}, {formattedTime}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Today's Metal Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Today's Metal Rates in {selectedCity === 'delhi' ? 'India' : getCityDisplayName(selectedCity)}
            </CardTitle>
            <CitySelector
              value={selectedCity}
              onValueChange={setSelectedCity}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading || todaysRateCards.length === 0 ? (
              <>
                <MetalRateCardSkeleton />
                <MetalRateCardSkeleton />
                <MetalRateCardSkeleton />
              </>
            ) : (
              todaysRateCards.map((card, index) => (
                <MetalRateCardComponent key={index} data={card} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical Metal Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Historical Metal Rates in {selectedCity === 'delhi' ? 'India' : getCityDisplayName(selectedCity)} for Last 10 Days
            </CardTitle>
            <div className="flex items-center gap-4">
              <UnitSelector
                value={historicalUnit}
                onValueChange={setHistoricalUnit}
              />
              <CitySelector
                value={selectedCity}
                onValueChange={setSelectedCity}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HistoricalDataTable
            data={historicalData}
            isLoading={isLoading}
            error={goldError || silverError}
          />
        </CardContent>
      </Card>

      {/* Gold Rates in Top Cities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gold Rates in Top Cities</CardTitle>
            <GoldUnitSelector
              value={topCitiesUnit}
              onValueChange={setTopCitiesUnit}
            />
          </div>
        </CardHeader>
        <CardContent>
          <TopCitiesTable
            data={topCitiesData}
            isLoading={goldLoading}
            error={goldError}
          />
        </CardContent>
      </Card>
    </div>
  );
}