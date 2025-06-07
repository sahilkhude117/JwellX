import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InvoiceItemDetail } from '@/lib/types/invoice';

interface InvoiceItemsTableProps {
  items: InvoiceItemDetail[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const calculateRate = (item: InvoiceItemDetail) => {
    return (item.metalPrice + item.makingCharges) / item.quantity;
  };

  return (
    <div className="mb-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">S.No.</TableHead>
            <TableHead>Item Details</TableHead>
            <TableHead className="w-24">HSN/SAC</TableHead>
            <TableHead className="w-20 text-center">Quantity</TableHead>
            <TableHead className="w-32 text-right">Rate</TableHead>
            <TableHead className="w-32 text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">{item.variantDescription}</p>
                </div>
              </TableCell>
              <TableCell className="text-center">{item.hsnCode}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(calculateRate(item))}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(item.lineTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}