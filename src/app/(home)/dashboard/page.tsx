'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

// Types
type TimePeriod = 'today' | 'week' | 'month' | 'year';

type Kpi = {
  value: number;
  changeVsPreviousPeriod: number;
};

type ChartDataPoint = {
  label: string;
  revenue: number;
  profit: number;
  unitsSold: number;
};

type TopListItem = {
  id: string;
  name: string;
  value: number;
  progress?: number;
};

type MetalRatePoint = {
  date: string;
  goldRate: number;
  silverRate: number;
};

type SophisticatedDashboardData = {
  kpis: {
    totalRevenue: Kpi;
    profit: Kpi;
    avgSaleValue: Kpi;
    newCustomers: Kpi;
  };
  mainChartData: ChartDataPoint[];
  topPerformers: {
    products: TopListItem[];
    categories: TopListItem[];
    staff: TopListItem[];
  };
  metalRateTrend: MetalRatePoint[];
};

// Mock Data
const mockSophisticatedData: SophisticatedDashboardData = {
  kpis: {
    totalRevenue: { value: 875400, changeVsPreviousPeriod: 15.2 },
    profit: { value: 210800, changeVsPreviousPeriod: 8.1 },
    avgSaleValue: { value: 21885, changeVsPreviousPeriod: -2.5 },
    newCustomers: { value: 42, changeVsPreviousPeriod: 20.0 },
  },
  mainChartData: [
    { label: 'Rings', revenue: 450000, profit: 110000, unitsSold: 25 },
    { label: 'Chains', revenue: 250000, profit: 60000, unitsSold: 30 },
    { label: 'Earrings', revenue: 175400, profit: 40800, unitsSold: 45 },
    { label: 'Bracelets', revenue: 120000, profit: 28000, unitsSold: 20 },
    { label: 'Pendants', revenue: 98000, profit: 22000, unitsSold: 35 },
  ],
  topPerformers: {
    products: [
      { id: 'p1', name: 'Diamond Solitaire Ring', value: 150000, progress: 100 },
      { id: 'p2', name: '24K Gold Bar (10g)', value: 72000, progress: 48 },
      { id: 'p3', name: 'Pearl Necklace Set', value: 65000, progress: 43 },
      { id: 'p4', name: 'Silver Chain Collection', value: 45000, progress: 30 },
    ],
    categories: [
      { id: 'c1', name: 'Wedding Collection', value: 320000, progress: 100 },
      { id: 'c2', name: 'Daily Wear', value: 180000, progress: 56 },
      { id: 'c3', name: 'Festival Special', value: 140000, progress: 44 },
      { id: 'c4', name: 'Modern Designs', value: 95000, progress: 30 },
    ],
    staff: [
      { id: 's1', name: 'Priya Mehta', value: 480000, progress: 100 },
      { id: 's2', name: 'Rohan Sharma', value: 395400, progress: 82 },
      { id: 's3', name: 'Anita Singh', value: 320000, progress: 67 },
      { id: 's4', name: 'Vikram Patel', value: 280000, progress: 58 },
    ],
  },
  metalRateTrend: [
    { date: 'May 09', goldRate: 7150, silverRate: 85 },
    { date: 'May 10', goldRate: 7210, silverRate: 86 },
    { date: 'May 11', goldRate: 7180, silverRate: 84 },
    { date: 'May 12', goldRate: 7250, silverRate: 87 },
    { date: 'May 13', goldRate: 7320, silverRate: 89 },
    { date: 'May 14', goldRate: 7280, silverRate: 88 },
    { date: 'Today', goldRate: 7350, silverRate: 90 },
  ],
};

// Context for Time Filter
const DashboardContext = createContext<{
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  data: SophisticatedDashboardData;
}>({
  timePeriod: 'month',
  setTimePeriod: () => {},
  data: mockSophisticatedData,
});

// Format currency function
const formatCurrency = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value.toLocaleString()}`;
};

// Global Time Filter Component
const GlobalTimeFilter: React.FC = () => {
  const { timePeriod, setTimePeriod } = useContext(DashboardContext);

  return (
    <div className="mb-6 p-4 bg-background border rounded-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <ToggleGroup
          type="single"
          value={timePeriod}
          onValueChange={(value) => value && setTimePeriod(value as TimePeriod)}
          className="bg-muted"
        >
          <ToggleGroupItem value="today" className="text-sm">Today</ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-sm">This Week</ToggleGroupItem>
          <ToggleGroupItem value="month" className="text-sm">This Month</ToggleGroupItem>
          <ToggleGroupItem value="year" className="text-sm">This Year</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  formatter?: (value: number) => string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, formatter = formatCurrency }) => {
  const isPositive = change >= 0;
  const { timePeriod } = useContext(DashboardContext);
  
  const getPeriodText = () => {
    switch (timePeriod) {
      case 'today': return 'vs. yesterday';
      case 'week': return 'vs. last week';
      case 'month': return 'vs. last month';
      case 'year': return 'vs. last year';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{formatter(value)}</div>
      </CardContent>
      <CardFooter>
        <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="ml-1">{Math.abs(change)}%</span>
          <span className="ml-2 text-muted-foreground">{getPeriodText()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Main Analytics Chart Component
const MainAnalyticsChart: React.FC = () => {
  const { data } = useContext(DashboardContext);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit' | 'unitsSold'>('revenue');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'revenue': return 'Revenue';
      case 'profit': return 'Profit';
      case 'unitsSold': return 'Units Sold';
    }
  };

  const formatYAxis = (value: number) => {
    if (selectedMetric === 'unitsSold') return value.toString();
    return formatCurrency(value);
  };

  const Chart = chartType === 'bar' ? BarChart : LineChart;
  const DataComponent = chartType === 'bar' ? 
    <Bar dataKey={selectedMetric} fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} /> :
    <Line type="monotone" dataKey={selectedMetric} stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ fill: "hsl(var(--foreground))" }} />;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Business Performance</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedMetric} onValueChange={(value: 'revenue' | 'profit' | 'unitsSold') => setSelectedMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="unitsSold">Units Sold</SelectItem>
              </SelectContent>
            </Select>
            <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as 'bar' | 'line')}>
              <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
              <ToggleGroupItem value="line">Line</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <Chart data={data.mainChartData}>
            <XAxis 
              dataKey="label" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))' }} 
              contentStyle={{ 
                background: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [formatYAxis(value), getMetricLabel()]}
            />
            {DataComponent}
          </Chart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Top Performers Component
const TopPerformers: React.FC = () => {
  const { data } = useContext(DashboardContext);
  const [activeTab, setActiveTab] = useState('products');

  const renderPerformerList = (items: TopListItem[]) => (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(item.value)}</span>
          </div>
          {item.progress && (
            <Progress value={item.progress} className="h-2" />
          )}
        </div>
      ))}
    </div>
  );

  const getReportLink = () => {
    switch (activeTab) {
      case 'products': return '/reports/products';
      case 'categories': return '/reports/categories';
      case 'staff': return '/reports/staff';
      default: return '/reports';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            {renderPerformerList(data.topPerformers.products)}
          </TabsContent>
          <TabsContent value="categories" className="mt-4">
            {renderPerformerList(data.topPerformers.categories)}
          </TabsContent>
          <TabsContent value="staff" className="mt-4">
            {renderPerformerList(data.topPerformers.staff)}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm">
          View Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

// Metal Rates Trend Component
const MetalRatesTrend: React.FC = () => {
  const { data } = useContext(DashboardContext);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Live Metal Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.metalRateTrend}>
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="goldRate" 
              stroke="hsl(var(--foreground))" 
              strokeWidth={2}
              name="Gold (₹/g)"
            />
            <Line 
              type="monotone" 
              dataKey="silverRate" 
              stroke="hsl(var(--foreground))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Silver (₹/g)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Recent Activity Component
const RecentActivity: React.FC = () => {
  const activities = [
    { id: 1, action: 'New sale completed', customer: 'Rajesh Kumar', amount: 45000, time: '2 min ago' },
    { id: 2, action: 'Inventory updated', item: 'Gold Rings', quantity: 25, time: '15 min ago' },
    { id: 3, action: 'Customer registered', customer: 'Sunita Devi', time: '1 hour ago' },
    { id: 4, action: 'Payment received', customer: 'Amit Sharma', amount: 78000, time: '2 hours ago' },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.customer && `Customer: ${activity.customer}`}
                  {activity.item && `Item: ${activity.item}`}
                  {activity.quantity && ` (Qty: ${activity.quantity})`}
                </p>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(activity.amount)}</p>
                )}
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          View All Activities
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main Dashboard Page Component
const DashboardPage: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [data, setData] = useState<SophisticatedDashboardData>(mockSophisticatedData);

  // Simulate data fetching when time period changes
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll just use the mock data
    setData(mockSophisticatedData);
  }, [timePeriod]);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <GlobalTimeFilter />
          
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* KPI Row */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <KpiCard
                title="Total Revenue"
                value={data.kpis.totalRevenue.value}
                change={data.kpis.totalRevenue.changeVsPreviousPeriod}
                icon={<DollarSign size={20} />}
              />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <KpiCard
                title="Profit"
                value={data.kpis.profit.value}
                change={data.kpis.profit.changeVsPreviousPeriod}
                icon={<TrendingUp size={20} />}
              />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <KpiCard
                title="Avg Sale Value"
                value={data.kpis.avgSaleValue.value}
                change={data.kpis.avgSaleValue.changeVsPreviousPeriod}
                icon={<Package size={20} />}
              />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <KpiCard
                title="New Customers"
                value={data.kpis.newCustomers.value}
                change={data.kpis.newCustomers.changeVsPreviousPeriod}
                icon={<Users size={20} />}
                formatter={(value) => value.toString()}
              />
            </div>

            {/* Main Chart and Top Performers */}
            <div className="col-span-12 lg:col-span-8">
              <MainAnalyticsChart />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <TopPerformers />
            </div>

            {/* Metal Rates and Recent Activity */}
            <div className="col-span-12 md:col-span-6">
              <MetalRatesTrend />
            </div>
            <div className="col-span-12 md:col-span-6">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

