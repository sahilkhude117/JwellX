'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { CalendarIcon, ChevronDown, Download, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

import { StockAdjustmentLogItem, AdjustmentType } from '@/lib/types/inventory';
import { mockStockAdjustmentHistory } from '@/lib/mock/inventory';

interface FiltersState {
  dateRange?: DateRange;
  productSearch: string;
  userId: string;
  adjustmentType: string;
}

const adjustmentTypeOptions: { value: AdjustmentType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'THEFT_LOSS', label: 'Theft/Loss' },
  { value: 'RETURN_TO_SUPPLIER', label: 'Return to Supplier' },
  { value: 'MARKETING_SAMPLE', label: 'Marketing Sample' },
];

const adjustmentTypeBadgeVariants: Record<AdjustmentType, string> = {
  CORRECTION: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  DAMAGE: 'bg-red-100 text-red-800 hover:bg-red-200',
  THEFT_LOSS: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  RETURN_TO_SUPPLIER: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  MARKETING_SAMPLE: 'bg-green-100 text-green-800 hover:bg-green-200',
};

function TruncatedNotes({ notes }: { notes?: string }) {
  if (!notes) return <span className="text-muted-foreground">—</span>;
  
  if (notes.length <= 50) {
    return <span>{notes}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-left hover:underline">
          {notes.substring(0, 50)}...
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="text-sm">{notes}</p>
      </PopoverContent>
    </Popover>
  );
}

function MobileAdjustmentCard({ adjustment }: { adjustment: StockAdjustmentLogItem }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Top Row: Product and Timestamp */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Link 
                href={`/dashboard/inventory/products/${adjustment.productVariant.id}`}
                className="font-medium hover:underline"
              >
                {adjustment.productVariant.name}
              </Link>
              <p className="text-sm text-muted-foreground">{adjustment.productVariant.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{format(new Date(adjustment.timestamp), 'MMM dd, yyyy')}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(adjustment.timestamp), 'h:mm a')}</p>
            </div>
          </div>

          {/* Middle Row: Quantity Change */}
          <div className="flex justify-center">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                {adjustment.quantityBefore} → {adjustment.quantityAfter}
              </div>
              <div className={cn(
                "text-sm font-medium",
                adjustment.change > 0 ? "text-green-600" : "text-red-600"
              )}>
                ({adjustment.change > 0 ? '+' : ''}{adjustment.change})
              </div>
            </div>
          </div>

          {/* Bottom Row: User and Reason */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>By:</span>
            <Link href={`/dashboard/users/${adjustment.user.id}`} className="font-medium hover:underline">
              {adjustment.user.name}
            </Link>
            <span>•</span>
            <Badge 
              variant="secondary"
              className={adjustmentTypeBadgeVariants[adjustment.adjustmentType]}
            >
              {adjustmentTypeOptions.find(opt => opt.value === adjustment.adjustmentType)?.label}
            </Badge>
          </div>

          {/* Notes */}
          {adjustment.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <TruncatedNotes notes={adjustment.notes} />
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StockAdjustmentHistoryPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filters, setFilters] = useState<FiltersState>({
    productSearch: '',
    userId: 'ALL',
    adjustmentType: 'ALL',
  });

  // Get unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const users = mockStockAdjustmentHistory.map(item => item.user);
    const uniqueUsersMap = new Map();
    users.forEach(user => uniqueUsersMap.set(user.id, user));
    return Array.from(uniqueUsersMap.values());
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return mockStockAdjustmentHistory.filter(item => {
      // Date range filter
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const itemDate = new Date(item.timestamp);
        if (itemDate < filters.dateRange.from || itemDate > filters.dateRange.to) {
          return false;
        }
      }

      // Product search filter
      if (filters.productSearch) {
        const searchTerm = filters.productSearch.toLowerCase();
        const matchesProduct = item.productVariant.name.toLowerCase().includes(searchTerm) ||
                               item.productVariant.sku.toLowerCase().includes(searchTerm);
        if (!matchesProduct) return false;
      }

      // User filter
      if (filters.userId !== 'ALL' && item.user.id !== filters.userId) {
        return false;
      }

      // Adjustment type filter
      if (filters.adjustmentType !== 'ALL' && item.adjustmentType !== filters.adjustmentType) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const columns: ColumnDef<StockAdjustmentLogItem>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Date & Time',
      cell: ({ row }) => {
        const timestamp = row.getValue('timestamp') as string;
        return (
          <div>
            <div className="font-medium">{format(new Date(timestamp), 'MMM dd, yyyy')}</div>
            <div className="text-sm text-muted-foreground">{format(new Date(timestamp), 'h:mm a')}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'productVariant',
      header: 'Product (SKU)',
      cell: ({ row }) => {
        const productVariant = row.getValue('productVariant') as StockAdjustmentLogItem['productVariant'];
        return (
          <div>
            <Link 
              href={`/dashboard/inventory/products/${productVariant.id}`}
              className="font-medium hover:underline"
            >
              {productVariant.name}
            </Link>
            <div className="text-sm text-muted-foreground">{productVariant.sku}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.getValue('user') as StockAdjustmentLogItem['user'];
        return (
          <Link href={`/dashboard/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>
        );
      },
    },
    {
      accessorKey: 'adjustmentType',
      header: 'Adjustment Type',
      cell: ({ row }) => {
        const type = row.getValue('adjustmentType') as AdjustmentType;
        return (
          <Badge 
            variant="secondary"
            className={adjustmentTypeBadgeVariants[type]}
          >
            {adjustmentTypeOptions.find(opt => opt.value === type)?.label}
          </Badge>
        );
      },
    },
    {
      id: 'quantityChange',
      header: 'Quantity Change',
      cell: ({ row }) => {
        const { quantityBefore, quantityAfter, change } = row.original;
        return (
          <div className="font-medium">
            <strong>{quantityBefore} → {quantityAfter}</strong>
            <span className={cn(
              "ml-2",
              change > 0 ? "text-green-600" : "text-red-600"
            )}>
              ({change > 0 ? '+' : ''}{change})
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => {
        const notes = row.getValue('notes') as string | undefined;
        return <TruncatedNotes notes={notes} />;
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleResetFilters = () => {
    setFilters({
      productSearch: '',
      userId: 'ALL',
      adjustmentType: 'ALL',
    });
  };

  const exportToCSV = () => {
    const headers = ['Date & Time', 'Product Name', 'SKU', 'User', 'Adjustment Type', 'Quantity Before', 'Quantity After', 'Change', 'Notes'];
    const csvData = filteredData.map(item => [
      format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      item.productVariant.name,
      item.productVariant.sku,
      item.user.name,
      item.adjustmentType,
      item.quantityBefore,
      item.quantityAfter,
      item.change,
      item.notes || '',
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-adjustments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Stock Adjustment History</h1>
          <p className="text-muted-foreground">A detailed log of all manual changes made to inventory quantities.</p>
      </div>

      {/* Filters Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Use the filters below to narrow down the adjustment history
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                          {format(filters.dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(filters.dateRange.from, 'LLL dd, y')
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
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Product/SKU Search */}
            <div className="space-y-2">
              <Label>Product/SKU</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search product or SKU..."
                  value={filters.productSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, productSearch: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label>User</Label>
              <Select
                value={filters.userId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, userId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Adjustment Type Filter */}
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select
                value={filters.adjustmentType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, adjustmentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {mockStockAdjustmentHistory.length} adjustments
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleResetFilters}>
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden md:block mt-6">
        <Card className='pt-0'>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                      No adjustments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Desktop Pagination */}
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} of{' '}
            {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {filteredData.length > 0 ? (
          <div>
            {filteredData
              .slice(
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize
              )
              .map((adjustment) => (
                <MobileAdjustmentCard key={adjustment.id} adjustment={adjustment} />
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No adjustments found.</p>
            </CardContent>
          </Card>
        )}

        {/* Mobile Pagination */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}