'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProductDataRow } from '@/lib/types/product';
import { Arrow } from '@radix-ui/react-tooltip';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Package } from 'lucide-react';
import Link from 'next/link';
import { ProductActions } from './product-actions';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const columns: ColumnDef<ProductDataRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                aria-label="Select all products"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Product
                    <ArrowUpDown className='ml-2 h-4 w-4'/>
                </Button>
            );
        },
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={product.imageUrl} alt={product.name} />
                        <AvatarFallback>
                            <Package className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Link href={`/products/product-list/${product.id}`}>
                            <div className="font-medium hover:underline">{product.name}</div>
                        </Link>
                            <div className="text-sm text-muted-foreground">{product.sku}</div>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
            return (
                <Badge variant="outline">
                    {row.original.category.name}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'variants',
        header: 'Variants',
        cell: ({ row }) => {
            const variantCount = row.original._count.variants;
            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                        {variantCount} Variants
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-2">
                        <h4 className="font-medium">Product Variants</h4>
                        <p className="text-sm text-muted-foreground">
                            This product has {variantCount} variant{variantCount !== 1 ? 's' : ''}.
                        </p>
                        <Link href={`/dashboard/products/${row.original.id}`}>
                            <Button size="sm" className="w-full">
                            View All Variants
                            </Button>
                        </Link>
                        </div>
                    </PopoverContent>
                </Popover>
            )
        }
    },
    {
        accessorKey: 'totalStock',
        header: ({ column }) => {
            return (
                <Button
                    variant={'ghost'}
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Total Stock
                    <ArrowUpDown className='ml-2 h-4 w-4'/>
                </Button>
            );
        },
        cell: ({ row }) => {
            const stock = row.original.totalStock;
            return (
                <div className={`font-medium ${stock < 10 ? 'text-red-600' : ''}`}>{stock}</div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                    {status}
                </Badge>
            );
         },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            return <ProductActions product={row.original} />;
        },
    },
];


interface DataTableProps {
    data: ProductDataRow[];
}

export function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },  
    });

    return (
        <div className='w-full'>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                );
                                })}
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
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                                </TableCell>
                            ))}
                            </TableRow>
                        ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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
        </div>
    )
}