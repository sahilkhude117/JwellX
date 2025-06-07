import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FullInvoiceDetails } from '@/lib/types/invoice';

interface InvoiceFooterProps {
  invoice: FullInvoiceDetails;
}

export function InvoiceFooter({ invoice }: InvoiceFooterProps) {
  const { summary, paymentHistory } = invoice;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Cash';
      case 'CREDIT_CARD': return 'Credit Card';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'UPI': return 'UPI';
      default: return method;
    }
  };

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const balanceDue = summary.grandTotal - totalPaid;

  return (
    <div className="space-y-6">
      {/* Totals Section */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(summary.subTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount:</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(summary.discount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxable Amount:</span>
            <span className="font-medium">{formatCurrency(summary.taxableAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">CGST @ 1.5%:</span>
            <span className="font-medium">{formatCurrency(summary.cgstAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SGST @ 1.5%:</span>
            <span className="font-medium">{formatCurrency(summary.sgstAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Grand Total:</span>
            <span>{formatCurrency(summary.grandTotal)}</span>
          </div>
          {balanceDue > 0 && (
            <div className="flex justify-between text-red-600 font-semibold">
              <span>Balance Due:</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount in Words */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-1">Amount in Words:</p>
        <p className="font-medium text-gray-900">{summary.amountInWords}</p>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>{getPaymentMethodLabel(payment.method)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(payment.amountPaid)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• All sales are final. No returns or exchanges without prior approval.</p>
          <p>• Payment is due within 30 days of invoice date.</p>
          <p>• Late payments may incur additional charges.</p>
          <p>• Goods remain the property of Radiant Jewels until full payment is received.</p>
        </div>
      </div>
    </div>
  );
}
