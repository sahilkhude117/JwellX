import { FullInvoiceDetails } from '@/lib/types/invoice'; // Adjust the import path as necessary

interface CustomerDetailsProps {
  customer: FullInvoiceDetails['customer'];
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
      <div className="space-y-1">
        <p className="font-medium text-gray-900">{customer.name}</p>
        <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
        {customer.address && (
          <p className="text-sm text-gray-600">{customer.address}</p>
        )}
      </div>
    </div>
  );
}