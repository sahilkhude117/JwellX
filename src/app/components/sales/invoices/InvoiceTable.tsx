import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { InvoiceRowData, InvoiceStatus } from "@/lib/types/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceActionsDropdown } from "./InvoiceActionsDropdown";
import { format } from "date-fns";

const columnHelper = createColumnHelper<InvoiceRowData>();

interface InvoiceTableProps {
  data: InvoiceRowData[];
  searchTerm: string;
  statusFilter: InvoiceStatus | 'all';
  dateRange: { from: Date | null; to: Date | null };
  onPaymentRecorded: (invoiceId: string, amount: number) => void;
  onInvoiceCanceled: (invoiceId: string) => void;
}

export function InvoiceTable({
  data,
  searchTerm,
  statusFilter,
  dateRange,
  onPaymentRecorded,
  onInvoiceCanceled,
}: InvoiceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("invoiceNumber", {
        header: "Invoice #",
        cell: (info) => (
          <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("customer", {
        header: "Customer",
        cell: (info) => {
          const customer = info.getValue();
          return (
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-gray-500">{customer.phone}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => format(new Date(info.getValue()), "PPP"),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <InvoiceStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("netAmount", {
        header: "Amount",
        cell: (info) => (
          <span className="font-medium">
            ₹{(info.getValue() / 100).toLocaleString('en-IN')}
          </span>
        ),
        sortingFn: "basic",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <InvoiceActionsDropdown
            invoice={info.row.original}
            onPaymentRecorded={onPaymentRecorded}
            onInvoiceCanceled={onInvoiceCanceled}
          />
        ),
      }),
    ],
    [onPaymentRecorded, onInvoiceCanceled]
  );

  const filteredData = useMemo(() => {
    return data.filter((invoice) => {
      // Search filter
      const searchMatch = !searchTerm || 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.phone.includes(searchTerm);

      // Status filter
      const statusMatch = statusFilter === 'all' || invoice.status === statusFilter;

      // Date range filter
      const invoiceDate = new Date(invoice.createdAt);
      const dateMatch = 
        (!dateRange.from || invoiceDate >= dateRange.from) &&
        (!dateRange.to || invoiceDate <= dateRange.to);

      return searchMatch && statusMatch && dateMatch;
    });
  }, [data, searchTerm, statusFilter, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:bg-gray-50 p-1 rounded"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
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
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}