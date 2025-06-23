"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarIcon, 
  Download, 
  Filter, 
  RefreshCw, 
  Check, 
  ChevronsUpDown,
  TrendingUp,
  DollarSign,
  FileText,
  Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

// Types
export type SalesReportFilters = {
  dateRange: { from: Date; to: Date };
  customers: string[];
  categories: string[];
  paymentMethods: string[];
};

export type SalesReportSummary = {
  totalRevenue: number;
  totalProfit: number;
  totalInvoices: number;
  totalItemsSold: number;
};

export type SalesLineItem = {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  lineProfit: number;
};

export type SalesReportData = {
  summary: SalesReportSummary;
  chartData: { label: string; revenue: number; profit: number }[];
  lineItems: SalesLineItem[];
};

// Mock Data
const mockCustomers = [
  { id: 'cust_001', name: 'Priya Mehta' },
  { id: 'cust_002', name: 'Rohan Sharma' },
  { id: 'cust_003', name: 'Anjali Patel' },
  { id: 'cust_004', name: 'Vikram Singh' },
  { id: 'cust_005', name: 'Sneha Gupta' },
];

const mockCategories = [
  { id: 'cat_001', name: 'Gold Jewelry' },
  { id: 'cat_002', name: 'Silver Jewelry' },
  { id: 'cat_003', name: 'Platinum Jewelry' },
  { id: 'cat_004', name: 'Diamond Jewelry' },
  { id: 'cat_005', name: 'Accessories' },
];

const mockPaymentMethods = [
  { id: 'cash', name: 'Cash' },
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'upi', name: 'UPI' },
  { id: 'bank_transfer', name: 'Bank Transfer' },
];

const mockSalesReportData: SalesReportData = {
  summary: {
    totalRevenue: 203700,
    totalProfit: 55900,
    totalInvoices: 2,
    totalItemsSold: 3,
  },
  chartData: [
    { label: 'Jun 07', revenue: 125500, profit: 35000 },
    { label: 'Jun 06', revenue: 78200, profit: 20900 },
    { label: 'Jun 05', revenue: 95300, profit: 28100 },
    { label: 'Jun 04', revenue: 67800, profit: 18200 },
    { label: 'Jun 03', revenue: 89400, profit: 24600 },
  ],
  lineItems: [
    { 
      invoiceId: 'inv_101', 
      invoiceNumber: 'INV-2025-001', 
      date: '2025-06-07T10:30:00.000Z', 
      customerName: 'Priya Mehta', 
      productName: 'Gold Earrings', 
      sku: 'EAR-005-A', 
      quantity: 1, 
      unitPrice: 45500, 
      lineTotal: 45500, 
      lineProfit: 12000 
    },
    { 
      invoiceId: 'inv_101', 
      invoiceNumber: 'INV-2025-001', 
      date: '2025-06-07T10:30:00.000Z', 
      customerName: 'Priya Mehta', 
      productName: 'Silver Chain', 
      sku: 'CHN-011-S', 
      quantity: 2, 
      unitPrice: 40000, 
      lineTotal: 80000, 
      lineProfit: 23000 
    },
    { 
      invoiceId: 'inv_102', 
      invoiceNumber: 'INV-2025-002', 
      date: '2025-06-06T14:00:00.000Z', 
      customerName: 'Rohan Sharma', 
      productName: 'Platinum Band', 
      sku: 'RNG-015-P', 
      quantity: 1, 
      unitPrice: 78200, 
      lineTotal: 78200, 
      lineProfit: 20900 
    },
  ],
};

// Utility Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const exportToCSV = (data: SalesLineItem[]) => {
  const headers = [
    'Invoice Number',
    'Date',
    'Customer Name',
    'Product Name',
    'SKU',
    'Quantity',
    'Unit Price',
    'Line Total',
    'Line Profit'
  ];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.invoiceNumber,
      format(new Date(item.date), 'yyyy-MM-dd'),
      item.customerName,
      item.productName,
      item.sku,
      item.quantity,
      item.unitPrice,
      item.lineTotal,
      item.lineProfit
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Components
const KpiCard = ({ title, value, icon: Icon, isLoading }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  isLoading?: boolean 
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

const MultiSelect = ({ 
  options, 
  selected, 
  onSelectionChange, 
  placeholder,
  searchPlaceholder 
}: {
  options: { id: string; name: string }[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter(item => item !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length > 0 
            ? `${selected.length} selected` 
            : placeholder
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <CommandItem key={option.id} onSelect={() => handleSelect(option.id)}>
                <Checkbox
                  checked={selected.includes(option.id)}
                  className="mr-2"
                />
                {option.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const DateRangePicker = ({ 
  value, 
  onChange 
}: { 
  value: { from: Date; to: Date }; 
  onChange: (range: { from: Date; to: Date }) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={{ from: value?.from, to: value?.to }}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onChange({ from: range.from, to: range.to });
              setIsOpen(false);
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

// Main Component
export default function SalesReportPage() {
  const [filters, setFilters] = useState<SalesReportFilters>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: new Date()
    },
    customers: [],
    categories: [],
    paymentMethods: []
  });

  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartGroupBy, setChartGroupBy] = useState<'day' | 'week' | 'category'>('day');

  const generateReport = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setReportData(mockSalesReportData);
    setIsLoading(false);
  };

  const resetFilters = () => {
    setFilters({
      dateRange: {
        from: startOfMonth(new Date()),
        to: new Date()
      },
      customers: [],
      categories: [],
      paymentMethods: []
    });
    setReportData(null);
  };

  const updateFilters = (key: keyof SalesReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Sales Report</h1>
          <p className="text-muted-foreground">Generate detailed sales reports with custom filters and export capabilities</p>
      </div>

      {/* Filters Panel */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => updateFilters('dateRange', range)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Customers</Label>
              <MultiSelect
                options={mockCustomers}
                selected={filters.customers}
                onSelectionChange={(selected) => updateFilters('customers', selected)}
                placeholder="All customers"
                searchPlaceholder="Search customers..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categories</Label>
              <MultiSelect
                options={mockCategories}
                selected={filters.categories}
                onSelectionChange={(selected) => updateFilters('categories', selected)}
                placeholder="All categories"
                searchPlaceholder="Search categories..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Payment Methods</Label>
              <MultiSelect
                options={mockPaymentMethods}
                selected={filters.paymentMethods}
                onSelectionChange={(selected) => updateFilters('paymentMethods', selected)}
                placeholder="All methods"
                searchPlaceholder="Search payment methods..."
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={isLoading}>
              {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Generate Report
            </Button>
            <Button variant="ghost" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportData || isLoading ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Total Revenue"
              value={reportData ? formatCurrency(reportData.summary.totalRevenue) : ''}
              icon={DollarSign}
              isLoading={isLoading}
            />
            <KpiCard
              title="Total Profit"
              value={reportData ? formatCurrency(reportData.summary.totalProfit) : ''}
              icon={TrendingUp}
              isLoading={isLoading}
            />
            <KpiCard
              title="Total Invoices"
              value={reportData ? reportData.summary.totalInvoices : ''}
              icon={FileText}
              isLoading={isLoading}
            />
            <KpiCard
              title="Items Sold"
              value={reportData ? reportData.summary.totalItemsSold : ''}
              icon={Package}
              isLoading={isLoading}
            />
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Sales Visualization</CardTitle>
              <Select value={chartGroupBy} onValueChange={(value: any) => setChartGroupBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">By Day</SelectItem>
                  <SelectItem value="week">By Week</SelectItem>
                  <SelectItem value="category">By Category</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                    <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className='mt-6 mb-6'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Itemized Sales Report</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => reportData && exportToCSV(reportData.lineItems)}
                disabled={isLoading || !reportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                        <TableHead className="text-right">Line Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData?.lineItems.map((item, index) => (
                        <TableRow key={`${item.invoiceId}-${index}`}>
                          <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                          <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{item.customerName}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.sku}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.lineTotal)}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {formatCurrency(item.lineProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No Report Generated</h3>
              <p className="text-muted-foreground">
                Set your filters above and click "Generate Report" to get started
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}