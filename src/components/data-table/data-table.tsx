import { useState } from "react";
import { TableConfig } from "./types";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, RowSelectionState, SortingState, useReactTable } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { TableSkeleton } from "./table-skeleton";
import { TableFilters } from "./table-filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TableEmptyState } from "./table-empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface DataTableProps<TData> extends TableConfig<TData> {};

export function DataTable<TData>({
    columns: userColumns,
    data,
    totalCount,
    loading,
    filters = [],
    bulkActions = [],
    actions = [],
    emptyState,
    enableSorting = true,
    enableSelection = true,
    enablePagination = true,
    pageSize = 10,
    currentPage = 1,
    onPageChange,
    onPageSizeChange,
    onFiltersChange,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});

    // add selection column if enabled
    const selectionColumn: ColumnDef<TData> = {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
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
        size: 50,
    };

    // add actions columns if actions are provided
    const actionsColumn: ColumnDef<TData> = {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    {actions.map((action, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={() => action.onClick(row.original)}
                            disabled={action.disabled?.(row.original)}
                            className={action.variant === "destructive" ? "text-destructive" : ""}
                        >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 100,
    };

    // build final columns array
    const columns: ColumnDef<TData>[] = [
        ...(enableSelection ? [selectionColumn] : []),
        ...userColumns,
        ...(actions.length > 0 ? [actionsColumn] : []),
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting: enableSorting ? sorting : undefined,
            rowSelection: enableSelection ? rowSelection : undefined,
        },
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pageSize),
    });

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);
        onFiltersChange?.(newFilters);
    };

    const handleFilterClear = () => {
        setFilterValues({});
        onFiltersChange?.({});
    };

    const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    const hasSelectedRows = selectedRows.length > 0;

    return (
        <div className="space-y-4">
            {/* filters */}
            {filters.length > 0 && (
                <TableFilters
                    filters={filters}
                    values={filterValues}
                    onChange={handleFilterChange}
                    onClear={handleFilterClear}
                />
            )}

            {/* Bulk Actions */}
            {enableSelection && bulkActions.length > 0 && hasSelectedRows && !loading && (
                <div className="flex items-center space-x-2 bg-muted p-3 rounded-md">
                    <span className="text-sm text-muted-foreground">
                        {selectedRows.length} row(s) selected
                    </span>
                    {bulkActions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || 'outline'}
                            size={'sm'}
                            onClick={() => action.onClick(selectedRows)}
                            disabled={action.disabled}
                        >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <TableSkeleton
                    columns={columns.length}
                    showFilters={false}
                    showBulkActions={false}
                />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                                        >
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
                            ): (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24">
                                        {emptyState ? (
                                            <TableEmptyState {...emptyState} />
                                        ) : (
                                            <div className="text-center">No results found.</div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* pagination */}
            {enablePagination && totalCount > 0 && !loading && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">Rows per page</span>
                            <Select
                                value={pageSize.toString()}
                                onValueChange={(value) => onPageSizeChange?.(Number(value))}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Button
                                variant={'outline'}
                                size={'sm'}
                                onClick={() => onPageChange?.(currentPage - 1)}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>

                            <span className="text-sm px-2">
                                {currentPage} of {Math.ceil(totalCount / pageSize)}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange?.(currentPage + 1)}
                                disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
