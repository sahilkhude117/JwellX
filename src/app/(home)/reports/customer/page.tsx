'use client'
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Download, ExternalLink, Filter, ReceiptIndianRupee, RotateCcw, TrendingUp, TrendingUpDown, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
// Custom table components since @/components/ui/table is not available
const Table = ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className="w-full caption-bottom text-sm" {...props}>
    {children}
  </table>
);

const TableHeader = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="[&_tr]:border-b" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="[&_tr:last-child]:border-0" {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted" {...props}>
    {children}
  </tr>
);

const TableHead = ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" {...props}>
    {children}
  </th>
);

const TableCell = ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0" {...props}>
    {children}
  </td>
);
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import Papa from 'papaparse';
import { Skeleton } from '@/components/ui/skeleton';

// Types
type CustomerReportFilters = {
  acquiredDateRange?: { from: Date; to: Date };
  lastPurchaseDateRange?: { from: Date; to: Date };
  location?: { city?: string; state?: string };
  minLifetimeSpend?: number;
  minTotalOrders?: number;
};

type CustomerReportSummary = {
  totalCustomersInSegment: number;
  newCustomersInPeriod: number;
  totalSpendOfSegment: number;
  avgLifetimeSpend: number;
};

type CustomerReportItem = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string;
  dateJoined: string;
  lastPurchaseDate: string;
  totalOrders: number;
  lifetimeSpend: number;
  avgOrderValue: number;
};

type CustomerReportData = {
  summary: CustomerReportSummary;
  customers: CustomerReportItem[];
};

// Mock Data
const mockCustomerReportData: CustomerReportData = {
  summary: {
    totalCustomersInSegment: 3,
    newCustomersInPeriod: 1,
    totalSpendOfSegment: 821200,
    avgLifetimeSpend: 273733,
  },
  customers: [
    {
      id: 'cust_1',
      name: 'Priya Mehta',
      phone: '9876543211',
      email: 'priya.mehta@example.com',
      city: 'Mumbai',
      dateJoined: '2024-01-15T10:00:00.000Z',
      lastPurchaseDate: '2025-06-07T10:30:00.000Z',
      totalOrders: 4,
      lifetimeSpend: 485500,
      avgOrderValue: 121375,
    },
    {
      id: 'cust_3',
      name: 'Aarav Singh',
      phone: '9123456789',
      email: 'aarav.s@example.com',
      city: 'Nagpur',
      dateJoined: '2024-11-20T12:00:00.000Z',
      lastPurchaseDate: '2025-06-05T18:45:00.000Z',
      totalOrders: 1,
      lifetimeSpend: 257500,
      avgOrderValue: 257500,
    },
    {
      id: 'cust_2',
      name: 'Rohan Sharma',
      phone: '9876543210',
      email: 'rohan.sharma@example.com',
      city: 'Delhi',
      dateJoined: '2025-06-06T14:00:00.000Z',
      lastPurchaseDate: '2025-06-06T14:00:00.000Z',
      totalOrders: 1,
      lifetimeSpend: 78200,
      avgOrderValue: 78200,
    },
  ],
};

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatDateRange = (range: { from: Date; to: Date } | undefined) => {
  if (!range) return "Pick a date";
  if (range.from && range.to) {
    const fromStr = range.from.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const toStr = range.to.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    return `${fromStr} - ${toStr}`;
  }
  if (range.from) {
    return range.from.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  return "Pick a date";
};

// KPI Card Component
const KpiCard = ({ title, value, icon: Icon, isLoading }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  isLoading?: boolean 
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
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

// Date Range Picker Component
const DateRangePicker: React.FC<{
  range: { from: Date; to: Date } | undefined;
  onRangeChange: (range: { from: Date; to: Date } | undefined) => void;
  placeholder?: string;
}> = ({ range, onRangeChange, placeholder = "Pick a date" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDateRange(range)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="range"
          selected={range} //@ts-ignore
          onSelect={onRangeChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

// Main Component
const CustomerReportPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerReportFilters>({});
  const [reportData, setReportData] = useState<CustomerReportData | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter functions
  const applyFilters = (data: CustomerReportData, filters: CustomerReportFilters): CustomerReportData => {
    let filteredCustomers = [...data.customers];

    // Filter by acquired date range
    if (filters.acquiredDateRange?.from && filters.acquiredDateRange?.to) {
      filteredCustomers = filteredCustomers.filter(customer => {
        const joinDate = new Date(customer.dateJoined);
        return joinDate >= filters.acquiredDateRange!.from && joinDate <= filters.acquiredDateRange!.to;
      });
    }

    // Filter by last purchase date range
    if (filters.lastPurchaseDateRange?.from && filters.lastPurchaseDateRange?.to) {
      filteredCustomers = filteredCustomers.filter(customer => {
        const purchaseDate = new Date(customer.lastPurchaseDate);
        return purchaseDate >= filters.lastPurchaseDateRange!.from && purchaseDate <= filters.lastPurchaseDateRange!.to;
      });
    }

    // Filter by location
    if (filters.location?.city) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.city?.toLowerCase().includes(filters.location!.city!.toLowerCase())
      );
    }

    // Filter by minimum lifetime spend
    if (filters.minLifetimeSpend) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.lifetimeSpend >= filters.minLifetimeSpend!
      );
    }

    // Filter by minimum total orders
    if (filters.minTotalOrders) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.totalOrders >= filters.minTotalOrders!
      );
    }

    // Calculate summary
    const totalSpend = filteredCustomers.reduce((sum, customer) => sum + customer.lifetimeSpend, 0);
    const newCustomers = filters.acquiredDateRange ? filteredCustomers.filter(customer => {
      const joinDate = new Date(customer.dateJoined);
      return joinDate >= filters.acquiredDateRange!.from && joinDate <= filters.acquiredDateRange!.to;
    }).length : 0;

    return {
      summary: {
        totalCustomersInSegment: filteredCustomers.length,
        newCustomersInPeriod: newCustomers,
        totalSpendOfSegment: totalSpend,
        avgLifetimeSpend: filteredCustomers.length > 0 ? totalSpend / filteredCustomers.length : 0,
      },
      customers: filteredCustomers,
    };
  };

  const generateReport = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filteredData = applyFilters(mockCustomerReportData, filters);
    setReportData(filteredData);
    setIsLoading(false);
  };

  const resetFilters = () => {
    setFilters({});
    setReportData(null);
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = reportData.customers.map(customer => ({
      Name: customer.name,
      Phone: customer.phone,
      Email: customer.email || '',
      City: customer.city || '',
      'Date Joined': formatDate(customer.dateJoined),
      'Last Purchase': formatDate(customer.lastPurchaseDate),
      'Total Orders': customer.totalOrders,
      'Lifetime Spend': customer.lifetimeSpend,
      'Avg Order Value': customer.avgOrderValue,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customer-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table columns
  const columns: ColumnDef<CustomerReportItem>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <a
            href={`/customers/${row.original.id}`}
            className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {row.original.name}
            <ExternalLink className="h-3 w-3" />
          </a>
          <div className="text-sm text-muted-foreground">
            {row.original.phone}
          </div>
          {row.original.email && (
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Location',
      cell: ({ row }) => row.original.city || '-',
    },
    {
      accessorKey: 'dateJoined',
      header: 'Date Joined',
      cell: ({ row }) => formatDate(row.original.dateJoined),
    },
    {
      accessorKey: 'lastPurchaseDate',
      header: 'Last Purchase',
      cell: ({ row }) => formatDate(row.original.lastPurchaseDate),
    },
    {
      accessorKey: 'totalOrders',
      header: 'Total Orders',
      cell: ({ row }) => row.original.totalOrders,
    },
    {
      accessorKey: 'lifetimeSpend',
      header: 'Lifetime Spend',
      cell: ({ row }) => formatCurrency(row.original.lifetimeSpend),
    },
    {
      accessorKey: 'avgOrderValue',
      header: 'Avg. Order Value',
      cell: ({ row }) => formatCurrency(row.original.avgOrderValue),
    },
  ];

  const table = useReactTable({
    data: reportData?.customers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Customer Reports</h1>
          <p className="text-muted-foreground">Generate detailed customer reports with stock names, purchases and customer analysis</p>
      </div>
      {/* Filters Panel */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Customer Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date Joined</Label>
              <DateRangePicker
                range={filters.acquiredDateRange}
                onRangeChange={(range) =>
                  setFilters(prev => ({ ...prev, acquiredDateRange: range }))
                }
                placeholder="Select date range"
              />
            </div>

            <div className="space-y-2">
              <Label>Last Purchase Date</Label>
              <DateRangePicker
                range={filters.lastPurchaseDateRange}
                onRangeChange={(range) =>
                  setFilters(prev => ({ ...prev, lastPurchaseDateRange: range }))
                }
                placeholder="Select date range"
              />
            </div>

            <div className="space-y-2">
              <Label>Location (City)</Label>
              <Input
                placeholder="Enter city name"
                value={filters.location?.city || ''}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Lifetime Spend</Label>
              <Input
                type="number"
                placeholder="Enter minimum amount"
                value={filters.minLifetimeSpend || ''}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    minLifetimeSpend: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Total Orders</Label>
              <Input
                type="number"
                placeholder="Enter minimum orders"
                value={filters.minTotalOrders || ''}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    minTotalOrders: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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
            title="Total Customers"
            value={reportData.summary.totalCustomersInSegment}
            icon={User}
            isLoading={isLoading}
          />
          <KpiCard
            title="New Customers in Period"
            value={reportData.summary.newCustomersInPeriod}
            icon={TrendingUp}
            isLoading={isLoading}
          />
          <KpiCard
            title="Total Segment Spend"
            value={formatCurrency(reportData.summary.totalSpendOfSegment)}
            icon={DollarSign}
            isLoading={isLoading}
          />
          <KpiCard
            title="Avg. Lifetime Spend"
            value={formatCurrency(reportData.summary.avgLifetimeSpend)}
            icon={ReceiptIndianRupee}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Detailed Data Table */}
      {reportData && (
        <Card className='mt-6 mb-6'>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Customer Report</CardTitle>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder ? null : (
                              <div
                                className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: ' 🔼',
                                  desc: ' 🔽',
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
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
              {reportData.customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold">{customer.name}</div>
                      <a
                        href={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Lifetime Spend:</span>
                        <div>{formatCurrency(customer.lifetimeSpend)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Last Purchase:</span>
                        <div>{formatDate(customer.lastPurchaseDate)}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div>{customer.phone}</div>
                      {customer.email && <div>{customer.email}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerReportPage;