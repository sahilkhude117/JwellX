import { InvoiceRowData, InvoiceStatus } from "@/lib/types/invoice";
import { MobileInvoiceCard } from "./MobileInvoiceCard";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface MobileInvoiceListProps {
  data: InvoiceRowData[];
  searchTerm: string;
  statusFilter: InvoiceStatus | 'all';
  dateRange: { from: Date | null; to: Date | null };
  onPaymentRecorded: (invoiceId: string, amount: number) => void;
  onInvoiceCanceled: (invoiceId: string) => void;
}

export function MobileInvoiceList({
  data,
  searchTerm,
  statusFilter,
  dateRange,
  onPaymentRecorded,
  onInvoiceCanceled,
}: MobileInvoiceListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

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

  const paginatedData = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {paginatedData.length > 0 ? (
        paginatedData.map((invoice) => (
          <MobileInvoiceCard
            key={invoice.id}
            invoice={invoice}
            onPaymentRecorded={onPaymentRecorded}
            onInvoiceCanceled={onInvoiceCanceled}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No invoices found.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm font-medium px-4">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
}