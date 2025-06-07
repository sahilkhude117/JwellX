import { Badge } from '@/components/ui/badge';
import { FullInvoiceDetails } from '@/lib/types/invoice'; // Adjust the import path as necessary
import Image from 'next/image';

interface InvoiceHeaderProps {
  invoice: FullInvoiceDetails;
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex justify-between items-start mb-8">
      {/* Shop Details */}
      <div className="flex items-start gap-4">
        {invoice.shopDetails.logoUrl && (
          <div className="w-16 h-16 relative">
            <Image
              src={invoice.shopDetails.logoUrl}
              alt={`${invoice.shopDetails.name} Logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {invoice.shopDetails.name}
          </h2>
          <p className="text-sm text-gray-600 mb-1">
            {invoice.shopDetails.address}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            Phone: {invoice.shopDetails.phone}
          </p>
          <p className="text-sm text-gray-600">
            GSTIN: {invoice.shopDetails.gstin}
          </p>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="text-right">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">INVOICE</h1>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">Invoice Number:</span>
            <p className="font-semibold">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Date:</span>
            <p className="font-semibold">{formatDate(invoice.createdAt)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Status:</span>
            <Badge className={`ml-2 ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}