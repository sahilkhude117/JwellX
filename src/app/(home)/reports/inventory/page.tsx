"use client";

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarIcon, Download, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export type InventoryReportFilters = {
  asOfDate: Date;
  categories: string[];
  locations: string[];
  stockStatus: ('In Stock' | 'Low Stock' | 'Out of Stock')[];
};

export type InventoryReportSummary = {
  totalItems: number;
  totalValueAtCost: number;
  totalValueAtRetail: number;
  potentialProfit: number;
};

export type InventoryReportItem = {
  productVariantId: string;
  sku: string;
  productName: string;
  variantDescription: string;
  category: string;
  location: string;
  unitCost: number;
  unitRetailPrice: number;
  quantityOnHand: number;
  totalValueAtCost: number;
  totalValueAtRetail: number;
  stockAgeInDays: number;
};

export type InventoryReportData = {
  summary: InventoryReportSummary;
  lineItems: InventoryReportItem[];
};

// Mock data
const mockInventoryReportData: InventoryReportData = {
  summary: {
    totalItems: 8,
    totalValueAtCost: 289100,
    totalValueAtRetail: 440360,
    potentialProfit: 151260,
  },
  lineItems: [
    {
      productVariantId: 'var_1a',
      sku: 'RING-001-A',
      productName: 'Elegant Gold Ring',
      variantDescription: '22K, 5.2g, Size 7',
      category: 'Rings',
      location: 'Main Showroom',
      unitCost: 30000,
      unitRetailPrice: 39860,
      quantityOnHand: 5,
      totalValueAtCost: 150000,
      totalValueAtRetail: 199300,
      stockAgeInDays: 35,
    },
    {
      productVariantId: 'var_4d',
      sku: 'CHN-005-G',
      productName: 'Classic Gold Chain',
      variantDescription: '22K, 10g',
      category: 'Chains',
      location: 'Safe',
      unitCost: 68000,
      unitRetailPrice: 75000,
      quantityOnHand: 2,
      totalValueAtCost: 136000,
      totalValueAtRetail: 150000,
      stockAgeInDays: 120,
    },
    {
      productVariantId: 'var_5e',
      sku: 'ANK-011-S',
      productName: 'Peacock Silver Anklet',
      variantDescription: '925 Sterling',
      category: 'Anklets',
      location: 'Main Showroom',
      unitCost: 1550,
      unitRetailPrice: 2500,
      quantityOnHand: 1,
      totalValueAtCost: 1550,
      totalValueAtRetail: 2500,
      stockAgeInDays: 250,
    },
    {
      productVariantId: 'var_6f',
      sku: 'EAR-008-B',
      productName: 'Diamond Stud Earrings',
      variantDescription: '0.5ct, 18K Gold',
      category: 'Earrings',
      location: 'Safe',
      unitCost: 85000,
      unitRetailPrice: 125000,
      quantityOnHand: 3,
      totalValueAtCost: 255000,
      totalValueAtRetail: 375000,
      stockAgeInDays: 45,
    },
    {
      productVariantId: 'var_7g',
      sku: 'BRC-012-C',
      productName: 'Tennis Bracelet',
      variantDescription: '14K White Gold',
      category: 'Bracelets',
      location: 'Main Showroom',
      unitCost: 42000,
      unitRetailPrice: 58000,
      quantityOnHand: 2,
      totalValueAtCost: 84000,
      totalValueAtRetail: 116000,
      stockAgeInDays: 90,
    },
  ],
};

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const exportToCSV = (data: InventoryReportItem[]) => {
  const headers = [
    'SKU',
    'Product Name',
    'Variant Description',
    'Category',
    'Location',
    'Quantity on Hand',
    'Unit Cost',
    'Unit Retail Price',
    'Total Value at Cost',
    'Total Value at Retail',
    'Stock Age (Days)',
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.sku,
      `"${item.productName}"`,
      `"${item.variantDescription}"`,
      item.category,
      item.location,
      item.quantityOnHand,
      item.unitCost,
      item.unitRetailPrice,
      item.totalValueAtCost,
      item.totalValueAtRetail,
      item.stockAgeInDays,
    ].join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// KPI Card Component
const KpiCard: React.FC<{
  title: string;
  value: string;
  description?: string;
}> = ({ title, value, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

// Multi-select component
const MultiSelect: React.FC<{
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}> = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value.length > 0 ? `${value.length} selected` : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
              onClick={() => {
                const newValue = value.includes(option)
                  ? value.filter(v => v !== option)
                  : [...value, option];
                onChange(newValue);
              }}
            >
              <input
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => {}}
                className="rounded"
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Main component
const InventoryReportPage: React.FC = () => {
  const [filters, setFilters] = useState<InventoryReportFilters>({
    asOfDate: new Date(),
    categories: [],
    locations: [],
    stockStatus: [],
  });

  const [reportData, setReportData] = useState<InventoryReportData | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Available filter options
  const availableCategories = ['Rings', 'Chains', 'Anklets', 'Earrings', 'Bracelets'];
  const availableLocations = ['Main Showroom', 'Safe', 'Storage'];
  const availableStockStatus = ['In Stock', 'Low Stock', 'Out of Stock'];

  // Generate report function
  const generateReport = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData(mockInventoryReportData);
      setIsLoading(false);
    }, 1000);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      asOfDate: new Date(),
      categories: [],
      locations: [],
      stockStatus: [],
    });
    setReportData(null);
  };

  // Table columns
  const columns: ColumnDef<InventoryReportItem>[] = [
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.productName}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.variantDescription}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.location}</Badge>
      ),
    },
    {
      accessorKey: 'quantityOnHand',
      header: 'Qty on Hand',
      cell: ({ row }) => (
        <span className="font-bold">{row.original.quantityOnHand}</span>
      ),
    },
    {
      accessorKey: 'unitCost',
      header: 'Unit Cost',
      cell: ({ row }) => formatCurrency(row.original.unitCost),
    },
    {
      accessorKey: 'unitRetailPrice',
      header: 'Unit Price',
      cell: ({ row }) => formatCurrency(row.original.unitRetailPrice),
    },
    {
      accessorKey: 'totalValueAtCost',
      header: 'Total Value (Cost)',
      cell: ({ row }) => formatCurrency(row.original.totalValueAtCost),
    },
    {
      accessorKey: 'stockAgeInDays',
      header: 'Stock Age (Days)',
      cell: ({ row }) => (
        <span className={cn(
          row.original.stockAgeInDays > 180 ? 'text-red-600 font-medium' :
          row.original.stockAgeInDays > 90 ? 'text-yellow-600' : 'text-green-600'
        )}>
          {row.original.stockAgeInDays}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: reportData?.lineItems || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Report</h1>
        <p className="text-muted-foreground">
          Generate detailed inventory reports with stock levels, values, and turnover analysis
        </p>
      </div>

      {/* Filters Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Inventory Report Filters
          </CardTitle>
          <CardDescription>
            Configure the parameters for your inventory analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* As Of Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">As Of Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.asOfDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.asOfDate ? format(filters.asOfDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.asOfDate}
                    onSelect={(date) => date && setFilters(prev => ({ ...prev, asOfDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <MultiSelect
                options={availableCategories}
                value={filters.categories}
                onChange={(categories) => setFilters(prev => ({ ...prev, categories }))}
                placeholder="Select categories"
              />
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Locations</label>
              <MultiSelect
                options={availableLocations}
                value={filters.locations}
                onChange={(locations) => setFilters(prev => ({ ...prev, locations }))}
                placeholder="Select locations"
              />
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Status</label>
              <MultiSelect
                options={availableStockStatus}
                value={filters.stockStatus}
                onChange={(stockStatus) => setFilters(prev => ({ ...prev, stockStatus: stockStatus as ('In Stock' | 'Low Stock' | 'Out of Stock')[] }))}
                placeholder="Select status"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button variant="ghost" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary KPIs */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Items"
            value={reportData.summary.totalItems.toString()}
            description="Items in inventory"
          />
          <KpiCard
            title="Value at Cost"
            value={formatCurrency(reportData.summary.totalValueAtCost)}
            description="Total cost investment"
          />
          <KpiCard
            title="Value at Retail"
            value={formatCurrency(reportData.summary.totalValueAtRetail)}
            description="Potential revenue"
          />
          <KpiCard
            title="Potential Profit"
            value={formatCurrency(reportData.summary.potentialProfit)}
            description="Retail minus cost"
          />
        </div>
      )}

      {/* Detailed Data Table */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Itemized Inventory Report</CardTitle>
                <CardDescription>
                  Detailed breakdown of all inventory items
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV(reportData.lineItems)}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {reportData.lineItems.map((item) => (
                <Card key={item.productVariantId}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">{item.sku}</div>
                        </div>
                        <Badge variant="secondary">{item.location}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Qty: <span className="font-medium">{item.quantityOnHand}</span></span>
                        <span>Age: <span className="font-medium">{item.stockAgeInDays} days</span></span>
                      </div>
                      <div className="text-sm">
                        <span>Value (Cost): <span className="font-medium">{formatCurrency(item.totalValueAtCost)}</span></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="text-sm text-muted-foreground text-center p-4">
                Export to CSV for complete data analysis on desktop
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryReportPage;