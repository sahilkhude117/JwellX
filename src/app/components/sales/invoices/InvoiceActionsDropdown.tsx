import { useState } from "react";
import { MoreHorizontal, Eye, CreditCard, Send, Trash2, Printer, Share } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { InvoiceRowData } from "@/lib/types/invoice";
import { InvoiceDetailsDialog } from "./InvoiceDetailsDialog";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface InvoiceActionsDropdownProps {
  invoice: InvoiceRowData;
  onPaymentRecorded: (invoiceId: string, amount: number) => void;
  onInvoiceCanceled: (invoiceId: string) => void;
}

export function InvoiceActionsDropdown({ invoice, onPaymentRecorded, onInvoiceCanceled }: InvoiceActionsDropdownProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Invoice for ${invoice.customer.name} - ₹${(invoice.netAmount / 100).toLocaleString('en-IN')}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Invoice ${invoice.invoiceNumber} for ${invoice.customer.name} - ₹${(invoice.netAmount / 100).toLocaleString('en-IN')}`);
    }
  };

  const handleCancel = () => {
    onInvoiceCanceled(invoice.id);
    setShowCancelDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDetails(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          {(invoice.status === 'PENDING' || invoice.status === 'PARTIAL') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowPayment(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Cancel Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InvoiceDetailsDialog
        invoice={invoice}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <RecordPaymentDialog
        invoice={invoice}
        open={showPayment}
        onOpenChange={setShowPayment}
        onPaymentRecorded={onPaymentRecorded}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel invoice {invoice.invoiceNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Cancel Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}