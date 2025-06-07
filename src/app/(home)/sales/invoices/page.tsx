"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceRowData, InvoiceStatus } from "@/lib/types/invoice";
import { mockInvoices } from "@/lib/mock/invoice";
import { InvoiceFilters } from "@/app/components/sales/invoices/InvoiceFilters";
import { InvoiceTable } from "@/app/components/sales/invoices/InvoiceTable";
import { MobileInvoiceList } from "@/app/components/sales/invoices/MobileInvoiceList";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRowData[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handlePaymentRecorded = (invoiceId: string, amount: number) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const remainingAmount = invoice.status === 'PARTIAL' 
            ? invoice.netAmount * 0.5 
            : invoice.netAmount;
          
          if (amount >= remainingAmount) {
            return { ...invoice, status: 'PAID' as InvoiceStatus };
          } else {
            return { ...invoice, status: 'PARTIAL' as InvoiceStatus };
          }
        }
        return invoice;
      })
    );
  };

  const handleInvoiceCanceled = (invoiceId: string) => {
    setInvoices(prevInvoices =>
      prevInvoices.filter(invoice => invoice.id !== invoiceId)
    );
  };

  const handleNewSale = () => {
    // Navigate to POS page
    window.location.href = '/dashboard/sales/pos';
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <div className="flex flex-col border bg-background rounded-lg p-4 sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
        <Button onClick={handleNewSale} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <InvoiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {isMobile ? (
        <MobileInvoiceList
          data={invoices}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          dateRange={dateRange}
          onPaymentRecorded={handlePaymentRecorded}
          onInvoiceCanceled={handleInvoiceCanceled}
        />
      ) : (
        <InvoiceTable
          data={invoices}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          dateRange={dateRange}
          onPaymentRecorded={handlePaymentRecorded}
          onInvoiceCanceled={handleInvoiceCanceled}
        />
      )}
    </div>
  );
}