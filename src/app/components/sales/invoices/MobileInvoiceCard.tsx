import { Card, CardContent } from "@/components/ui/card";
import { InvoiceRowData } from "@/lib/types/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceActionsDropdown } from "./InvoiceActionsDropdown";
import { format } from "date-fns";

interface MobileInvoiceCardProps {
  invoice: InvoiceRowData;
  onPaymentRecorded: (invoiceId: string, amount: number) => void;
  onInvoiceCanceled: (invoiceId: string) => void;
}

export function MobileInvoiceCard({ invoice, onPaymentRecorded, onInvoiceCanceled }: MobileInvoiceCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium text-blue-600">{invoice.invoiceNumber}</span>
          <div className="flex items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            <InvoiceActionsDropdown
              invoice={invoice}
              onPaymentRecorded={onPaymentRecorded}
              onInvoiceCanceled={onInvoiceCanceled}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="font-medium">{invoice.customer.name}</div>
            <div className="text-sm text-gray-500">{invoice.customer.phone}</div>
          </div>
          <div className="text-sm text-gray-500">
            {format(new Date(invoice.createdAt), "PPP")}
          </div>
        </div>
        <div className="flex justify-end">
          <span className="text-lg font-bold">
            ₹{(invoice.netAmount / 100).toLocaleString('en-IN')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}