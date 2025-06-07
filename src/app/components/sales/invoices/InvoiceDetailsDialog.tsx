import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoiceRowData } from "@/lib/types/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { format } from "date-fns";

interface InvoiceDetailsDialogProps {
  invoice: InvoiceRowData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDetailsDialog({ invoice, open, onOpenChange }: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Invoice Number:</span>
            <span>{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Status:</span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Customer:</span>
            <div className="text-right">
              <div className="font-medium">{invoice.customer.name}</div>
              <div className="text-sm text-gray-500">{invoice.customer.phone}</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Date:</span>
            <span>{format(new Date(invoice.createdAt), 'PPP')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Amount:</span>
            <span className="text-lg font-bold">
              ₹{(invoice.netAmount / 100).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
