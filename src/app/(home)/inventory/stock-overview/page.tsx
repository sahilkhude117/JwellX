'use client';


export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type StockRowData = {
    productVariantId: string;
    productId: string;
    productName: string;
    variantDescription: string;
    sku: string;
    category: string;
    location?: string;
    quantity: number;
    unitValue: number;
    status: StockStatus;
}

export type InventorySummary = {
    totalStockValue: number;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
}

export type AdjustmentType = 'Correction / Count' | 'New Stock / Purchase' | 'Damage / Loss' | 'Return to Supplier';

export const mockInventorySummary: InventorySummary = {
  totalStockValue: 18540300,
  totalItems: 152,
  lowStockItems: 7,
  outOfStockItems: 3,
};

export const mockStockData: StockRowData[] = [
  {
    productVariantId: 'var_1a',
    productId: 'prod_1',
    productName: 'Elegant Gold Ring',
    variantDescription: '22K, 5.2g, Size 7',
    sku: 'RING-001-A',
    category: 'Rings',
    location: 'Main Showroom',
    quantity: 5,
    unitValue: 39860,
    status: 'In Stock',
  },
  {
    productVariantId: 'var_2b',
    productId: 'prod_2',
    productName: 'Diamond Necklace',
    variantDescription: '18K White Gold, 1.2ct Diamond',
    sku: 'NECK-002-B',
    category: 'Necklaces',
    location: 'Safe',
    quantity: 2,
    unitValue: 350000,
    status: 'Low Stock',
  },
  {
    productVariantId: 'var_3c',
    productId: 'prod_3',
    productName: 'Silver Bangle',
    variantDescription: '925 Sterling, 25g',
    sku: 'BNG-003-C',
    category: 'Bangles',
    location: 'Main Showroom',
    quantity: 0,
    unitValue: 2500,
    status: 'Out of Stock',
  },
  {
    productVariantId: 'var_4d',
    productId: 'prod_4',
    productName: 'Gold Earrings',
    variantDescription: '22K Yellow Gold, 3.8g',
    sku: 'EAR-004-D',
    category: 'Earrings',
    location: 'Main Showroom',
    quantity: 8,
    unitValue: 28500,
    status: 'In Stock',
  },
  {
    productVariantId: 'var_5e',
    productId: 'prod_5',
    productName: 'Pearl Necklace',
    variantDescription: 'Freshwater Pearls, Silver Clasp',
    sku: 'NECK-005-E',
    category: 'Necklaces',
    location: 'Safe',
    quantity: 1,
    unitValue: 15000,
    status: 'Low Stock',
  },
];


import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MoreHorizontal,
  Search,
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, className }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
)

// Stock Status Badge Component
const StockStatusBadge: React.FC<{ status: StockRowData['status'] }> = ({ status }) => {
  const variants = {
    'In Stock': 'default',
    'Low Stock': 'destructive',
    'Out of Stock': 'secondary',
  } as const;

  const colors = {
    'In Stock': 'bg-green-100 text-green-800 hover:bg-green-100',
    'Low Stock': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    'Out of Stock': 'bg-red-100 text-red-800 hover:bg-red-100',
  };

  return (
    <Badge className={colors[status]}>
      {status}
    </Badge>
  );
};

// Stock Adjustment Dialog Component
interface StockAdjustmentDialogProps {
    item: StockRowData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({ 
    item,
    open,
    onOpenChange
}) => {
    const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('Correction / Count');
    const [newQuantity, setNewQuantity] = useState<number>(item.quantity);
    const [notes, setNotes] = useState<string>('');

    const handleConfirm = () => {
        // API call would go here
        console.log('Stock adjustment:', {
            productVariantId: item.productVariantId,
            adjustmentType,
            newQuantity: newQuantity,
            notes,
        });
        onOpenChange(false);
        // Reset form
        setNewQuantity(item.quantity);
        setNotes('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adjust Stock for {item.sku}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="text-sm text-muted-foreground">
                        Current Quantity: <span className="font-semibold">{item.quantity}</span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adjustment-type">Adjustment Type</Label>
                        <Select value={adjustmentType} onValueChange={(value: AdjustmentType) => setAdjustmentType(value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Correction / Count">Correction / Count</SelectItem>
                            <SelectItem value="New Stock / Purchase">New Stock / Purchase</SelectItem>
                            <SelectItem value="Damage / Loss">Damage / Loss</SelectItem>
                            <SelectItem value="Return to Supplier">Return to Supplier</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-quantity">New Quantity</Label>
                        <Input
                        id="new-quantity"
                        type="number"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                        min="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes *</Label>
                        <Textarea
                            id="notes"
                            placeholder="Enter reason for stock adjustment..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleConfirm} 
                            disabled={!notes.trim()}
                        >
                            Confirm Adjustment
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


//Mobile Card Component
const MobileStockCard: React.FC<{ item: StockRowData; onAdjustStock: () => void }> = ({
    item,
    onAdjustStock
}) => (
    <Card className="mb-4">
        <CardContent className="pt-4">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <Link
                        href={`/products/product-list/${item.productId}/edit`}
                        className='font-medium text-blue-600 hover:underline'
                    >
                        {item.productName}
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                    <StockStatusBadge status={item.status} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-8 w-8 p-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/products/product-list/${item.productId}/edit`}>
                                    View Product
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onAdjustStock}>
                                Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/inventory/history/${item.productVariantId}`}>
                                    View History
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
                {item.variantDescription}
            </div>

            <div className="flex justify-between items-center text-sm mb-2">
                <span><strong>SKU:</strong> {item.sku}</span>
                {item.location && (
                    <Badge variant="secondary">{item.location}</Badge>
                )}
            </div>

            <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                    Quantity: {item.quantity}
                </span>
                <span className="text-lg font-semibold">
                    Value: ₹{(item.unitValue * item.quantity).toLocaleString('en-IN')}
                </span>
            </div>
        </CardContent>
    </Card>
)


export default function StockOverviewPage() {
  const [data] = useState<StockRowData[]>(mockStockData);
  const [summary] = useState<InventorySummary>(mockInventorySummary);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<StockRowData | null>(null);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  // Get unique values for filters
  const categories = useMemo(() => 
    Array.from(new Set(data.map(item => item.category))).sort(), [data]
  );
  
  const locations = useMemo(() => 
    Array.from(new Set(data.map(item => item.location).filter((loc): loc is string => typeof loc === 'string'))).sort(), [data]
  );

  const columns: ColumnDef<StockRowData>[] = [
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <Link 
            href={`/products/product-list/${row.original.productId}/edit`}
            className="font-semibold text-blue-600 hover:underline"
          >
            {row.original.productName}
          </Link>
          <div className="text-sm text-muted-foreground">
            {row.original.variantDescription}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        row.original.location ? (
          <Badge variant="secondary">{row.original.location}</Badge>
        ) : null
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <span className="font-bold text-lg">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StockStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'unitValue',
      header: 'Unit Value',
      cell: ({ row }) => `₹${row.original.unitValue.toLocaleString('en-IN')}`,
    },
    {
      id: 'totalValue',
      header: 'Total Value',
      cell: ({ row }) => 
        `₹${(row.original.unitValue * row.original.quantity).toLocaleString('en-IN')}`,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/products/product-list/${row.original.productId}/edit`}>
                View Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setSelectedItem(row.original);
                setAdjustmentDialogOpen(true);
              }}
            >
              Adjust Stock
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/inventory/history/${row.original.productVariantId}`}>
                View History
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, value) => {
      const searchValue = value.toLowerCase();
      const productName = row.original.productName.toLowerCase();
      const variantDescription = row.original.variantDescription.toLowerCase();
      const sku = row.original.sku.toLowerCase();
      
      return productName.includes(searchValue) || 
             variantDescription.includes(searchValue) || 
             sku.includes(searchValue);
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="container max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex bg-background items-center border rounded-lg p-4 justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Stock Overview</h1>
        </div>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Stock Value"
          value={`₹${summary.totalStockValue.toLocaleString('en-IN')}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Total Unique Items (SKUs)"
          value={summary.totalItems}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Items with Low Stock"
          value={summary.lowStockItems}
          icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
          className="border-yellow-200"
        />
        <KpiCard
          title="Items Out of Stock"
          value={summary.outOfStockItems}
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          className="border-red-200"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, variant, or SKU..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={(table.getColumn('category')?.getFilterValue() as string) ?? ''}
              onValueChange={(value) =>
                table.getColumn('category')?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={(table.getColumn('location')?.getFilterValue() as string) ?? ''}
              onValueChange={(value) =>
                table.getColumn('location')?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
              onValueChange={(value) =>
                table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="pt-6">
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
                      data-state={row.getIsSelected() && 'selected'}
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
            
            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                of {table.getFilteredRowModel().rows.length} entries
              </div>
              <div className="space-x-2">
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
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <MobileStockCard
              key={row.id}
              item={row.original}
              onAdjustStock={() => {
                setSelectedItem(row.original);
                setAdjustmentDialogOpen(true);
              }}
            />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              No results found.
            </CardContent>
          </Card>
        )}
        
        {/* Mobile Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Stock Adjustment Dialog */}
      {selectedItem && (
        <StockAdjustmentDialog
          item={selectedItem}
          open={adjustmentDialogOpen}
          onOpenChange={setAdjustmentDialogOpen}
        />
      )}
    </div>
  );
}