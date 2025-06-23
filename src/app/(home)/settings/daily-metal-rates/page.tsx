'use client';

// types/settings.ts
export type MetalRateHistoryItem = {
  id: string;
  date: string; // ISO Date String
  material: 'GOLD_24K' | 'GOLD_22K' | 'SILVER_925' | 'PLATINUM_950';
  ratePerGram: number;
};

export type DailyRateUpdateForm = {
  date: Date;
  rates: {
    GOLD_24K: number;
    GOLD_22K: number;
    SILVER_925: number;
    PLATINUM_950: number;
  };
};

export type RateChartDataPoint = {
  date: string; // Formatted date e.g., "Jun 18"
  GOLD_24K?: number;
  GOLD_22K?: number;
  SILVER_925?: number;
  PLATINUM_950?: number;
};

// mock/data.ts
export const mockMetalRateHistory: MetalRateHistoryItem[] = [
  // Today's Data (June 18, 2025)
  { id: 'rate_1', date: '2025-06-18T00:00:00.000Z', material: 'GOLD_24K', ratePerGram: 7350 },
  { id: 'rate_2', date: '2025-06-18T00:00:00.000Z', material: 'GOLD_22K', ratePerGram: 6850 },
  { id: 'rate_3', date: '2025-06-18T00:00:00.000Z', material: 'SILVER_925', ratePerGram: 92 },
  { id: 'rate_4', date: '2025-06-18T00:00:00.000Z', material: 'PLATINUM_950', ratePerGram: 2800 },
  // Yesterday's Data
  { id: 'rate_5', date: '2025-06-17T00:00:00.000Z', material: 'GOLD_24K', ratePerGram: 7300 },
  { id: 'rate_6', date: '2025-06-17T00:00:00.000Z', material: 'GOLD_22K', ratePerGram: 6800 },
  { id: 'rate_7', date: '2025-06-17T00:00:00.000Z', material: 'SILVER_925', ratePerGram: 90 },
  { id: 'rate_8', date: '2025-06-17T00:00:00.000Z', material: 'PLATINUM_950', ratePerGram: 2750 },
  // More historical data
  { id: 'rate_9', date: '2025-06-16T00:00:00.000Z', material: 'GOLD_24K', ratePerGram: 7280 },
  { id: 'rate_10', date: '2025-06-16T00:00:00.000Z', material: 'GOLD_22K', ratePerGram: 6780 },
  { id: 'rate_11', date: '2025-06-16T00:00:00.000Z', material: 'SILVER_925', ratePerGram: 89 },
  { id: 'rate_12', date: '2025-06-16T00:00:00.000Z', material: 'PLATINUM_950', ratePerGram: 2720 },
  { id: 'rate_13', date: '2025-06-15T00:00:00.000Z', material: 'GOLD_24K', ratePerGram: 7250 },
  { id: 'rate_14', date: '2025-06-15T00:00:00.000Z', material: 'GOLD_22K', ratePerGram: 6750 },
  { id: 'rate_15', date: '2025-06-15T00:00:00.000Z', material: 'SILVER_925', ratePerGram: 88 },
  { id: 'rate_16', date: '2025-06-15T00:00:00.000Z', material: 'PLATINUM_950', ratePerGram: 2700 },
];

export const mockRateChartData: RateChartDataPoint[] = [
  { date: 'Jun 12', GOLD_24K: 7200, GOLD_22K: 6700, SILVER_925: 86, PLATINUM_950: 2650 },
  { date: 'Jun 13', GOLD_24K: 7220, GOLD_22K: 6720, SILVER_925: 87, PLATINUM_950: 2670 },
  { date: 'Jun 14', GOLD_24K: 7240, GOLD_22K: 6730, SILVER_925: 87, PLATINUM_950: 2680 },
  { date: 'Jun 15', GOLD_24K: 7250, GOLD_22K: 6750, SILVER_925: 88, PLATINUM_950: 2700 },
  { date: 'Jun 16', GOLD_24K: 7280, GOLD_22K: 6780, SILVER_925: 89, PLATINUM_950: 2720 },
  { date: 'Jun 17', GOLD_24K: 7300, GOLD_22K: 6800, SILVER_925: 90, PLATINUM_950: 2750 },
  { date: 'Jun 18', GOLD_24K: 7350, GOLD_22K: 6850, SILVER_925: 92, PLATINUM_950: 2800 },
];

// app/dashboard/settings/daily-metal-rates/page.tsx


import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const METAL_DISPLAY_NAMES = {
  GOLD_24K: 'Gold (24K)',
  GOLD_22K: 'Gold (22K)',
  SILVER_925: 'Silver (925)',
  PLATINUM_950: 'Platinum (950)',
};

const METAL_COLORS = {
  GOLD_24K: '#FFD700',
  GOLD_22K: '#DAA520',
  SILVER_925: '#C0C0C0',
  PLATINUM_950: '#8B7D6B',
};

export default function DailyMetalRatesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [historyData, setHistoryData] = useState<MetalRateHistoryItem[]>(mockMetalRateHistory);
  const [selectedMetal, setSelectedMetal] = useState<string>('ALL');
  const [visibleLines, setVisibleLines] = useState({
    GOLD_24K: true,
    GOLD_22K: true,
    SILVER_925: true,
    PLATINUM_950: true,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DailyRateUpdateForm>({
    defaultValues: {
      date: new Date(),
      rates: {
        GOLD_24K: 0,
        GOLD_22K: 0,
        SILVER_925: 0,
        PLATINUM_950: 0,
      },
    },
  });

  // Get latest rates for form initialization
  const latestRates = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaysRates: any = {};
    
    historyData
      .filter(item => item.date.startsWith(today))
      .forEach(item => {
        todaysRates[item.material] = item.ratePerGram;
      });

    return todaysRates;
  }, [historyData]);

  // Initialize form with latest rates
  useEffect(() => {
    Object.entries(latestRates).forEach(([material, rate]) => {
      setValue(`rates.${material as keyof DailyRateUpdateForm['rates']}`, rate as number);
    });
  }, [latestRates, setValue]);

  // Fetch rates from external API
  const fetchLatestRates = async () => {
    setIsFetching(true);
    try {
      // Simulate API call to external metal rates provider
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate updated rates from API
      const updatedRates = {
        GOLD_24K: 7365,
        GOLD_22K: 6865,
        SILVER_925: 93,
        PLATINUM_950: 2820,
      };

      Object.entries(updatedRates).forEach(([material, rate]) => {
        setValue(`rates.${material as keyof DailyRateUpdateForm['rates']}`, rate);
      });

      toast.success('Latest rates fetched successfully from external API');
    } catch (error) {
      toast.error('Failed to fetch latest rates');
    } finally {
      setIsFetching(false);
    }
  };

  // Process data for history table
  const processedHistoryData = useMemo(() => {
    const filteredData = selectedMetal === 'ALL' 
      ? historyData 
      : historyData.filter(item => item.material === selectedMetal);

    return filteredData.map(item => {
      const prevDayData = historyData.find(prev => 
        prev.material === item.material && 
        new Date(prev.date) < new Date(item.date)
      );
      
      const change = prevDayData ? item.ratePerGram - prevDayData.ratePerGram : 0;
      
      return {
        ...item,
        change,
        formattedDate: format(new Date(item.date), 'MMMM dd, yyyy'),
        formattedRate: `₹${item.ratePerGram.toLocaleString()}`,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [historyData, selectedMetal]);

  // Process data for chart
  const chartData = useMemo(() => {
    return mockRateChartData.map(point => ({
      ...point,
      ...(visibleLines.GOLD_24K ? {} : { GOLD_24K: undefined }),
      ...(visibleLines.GOLD_22K ? {} : { GOLD_22K: undefined }),
      ...(visibleLines.SILVER_925 ? {} : { SILVER_925: undefined }),
      ...(visibleLines.PLATINUM_950 ? {} : { PLATINUM_950: undefined }),
    }));
  }, [visibleLines]);

  const onSubmit = async (data: DailyRateUpdateForm) => {
    setIsLoading(true);
    try {
      // Simulate API call to save rates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state to reflect changes
      const newEntries: MetalRateHistoryItem[] = Object.entries(data.rates).map(([material, rate]) => ({
        id: `rate_${Date.now()}_${material}`,
        date: data.date.toISOString(),
        material: material as keyof typeof METAL_DISPLAY_NAMES,
        ratePerGram: rate,
      }));

      setHistoryData(prev => [...newEntries, ...prev.filter(item => 
        !item.date.startsWith(format(data.date, 'yyyy-MM-dd'))
      )]);

      toast.success('Today\'s rates saved successfully');
    } catch (error) {
      toast.error('Failed to save rates');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLineVisibility = (material: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [material]: !prev[material],
    }));
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Daily Metal Rates</h1>
          <p className="text-muted-foreground">Manage and track all Metal rates everyday</p>
      </div>
      {/* Update Today's Rates Card */}
      <Card className='mb-6'>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Update Today's Rates</CardTitle>
              <CardDescription>
                {format(new Date(), 'MMMM dd, yyyy')} - Rates automatically fetched from external providers
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLatestRates}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Fetch Latest
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(METAL_DISPLAY_NAMES).map(([key, displayName]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{displayName} Rate / gram</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id={key}
                      type="number"
                      step="0.01"
                      className="pl-8"
                      {...register(`rates.${key as keyof DailyRateUpdateForm['rates']}`, {
                        required: `${displayName} rate is required`,
                        min: { value: 0, message: 'Rate must be positive' },
                      })}
                    />
                  </div>
                  {errors.rates?.[key as keyof DailyRateUpdateForm['rates']] && (
                    <p className="text-sm text-destructive">
                      {errors.rates[key as keyof DailyRateUpdateForm['rates']]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Today's Rates
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Rate History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rate History</CardTitle>
          <CardDescription>
            View historical trends and detailed rate information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">History Table</TabsTrigger>
              <TabsTrigger value="chart">Trend Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="metal-filter">Filter by Metal:</Label>
                <Select value={selectedMetal} onValueChange={setSelectedMetal}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Metals</SelectItem>
                    {Object.entries(METAL_DISPLAY_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Rate / gram</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedHistoryData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.formattedDate}</TableCell>
                        <TableCell>{METAL_DISPLAY_NAMES[item.material]}</TableCell>
                        <TableCell className="font-medium">{item.formattedRate}</TableCell>
                        <TableCell>
                          {item.change !== 0 ? (
                            <Badge 
                              variant={item.change > 0 ? "default" : "destructive"}
                              className="flex items-center w-fit"
                            >
                              {item.change > 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {item.change > 0 ? '+' : ''}₹{item.change.toLocaleString()}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="chart" className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <Label>Toggle Metals:</Label>
                {Object.entries(METAL_DISPLAY_NAMES).map(([key, name]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={visibleLines[key as keyof typeof visibleLines]}
                      onCheckedChange={() => toggleLineVisibility(key as keyof typeof visibleLines)}
                    />
                    <Label htmlFor={key} className="text-sm font-normal">
                      {name}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${value?.toLocaleString()}`,
                        METAL_DISPLAY_NAMES[name as keyof typeof METAL_DISPLAY_NAMES]
                      ]}
                    />
                    {visibleLines.GOLD_24K && (
                      <Line
                        type="monotone"
                        dataKey="GOLD_24K"
                        stroke={METAL_COLORS.GOLD_24K}
                        strokeWidth={2}
                        dot={{ fill: METAL_COLORS.GOLD_24K, strokeWidth: 2 }}
                      />
                    )}
                    {visibleLines.GOLD_22K && (
                      <Line
                        type="monotone"
                        dataKey="GOLD_22K"
                        stroke={METAL_COLORS.GOLD_22K}
                        strokeWidth={2}
                        dot={{ fill: METAL_COLORS.GOLD_22K, strokeWidth: 2 }}
                      />
                    )}
                    {visibleLines.SILVER_925 && (
                      <Line
                        type="monotone"
                        dataKey="SILVER_925"
                        stroke={METAL_COLORS.SILVER_925}
                        strokeWidth={2}
                        dot={{ fill: METAL_COLORS.SILVER_925, strokeWidth: 2 }}
                      />
                    )}
                    {visibleLines.PLATINUM_950 && (
                      <Line
                        type="monotone"
                        dataKey="PLATINUM_950"
                        stroke={METAL_COLORS.PLATINUM_950}
                        strokeWidth={2}
                        dot={{ fill: METAL_COLORS.PLATINUM_950, strokeWidth: 2 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}