import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { FullInvoiceDetails } from '@/lib/types/invoice'; // Adjust the import path as necessary

interface InvoiceActionBarProps {
  invoice: FullInvoiceDetails;
  onRecordPayment?: () => void;
}

export function InvoiceActionBar({ invoice, onRecordPayment }: InvoiceActionBarProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print flex gap-2 p-4 border-b bg-white">
      <Link href="/dashboard/sales/invoices">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </Link>
      
      <Button onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print / Save as PDF
      </Button>
      
      {invoice.status !== 'PAID' && (
        <Button onClick={onRecordPayment}>
          <CreditCard className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      )}
    </div>
  );
}