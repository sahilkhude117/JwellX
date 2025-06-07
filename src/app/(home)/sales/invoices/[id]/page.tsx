'use client';

import { use, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { FullInvoiceDetails } from '@/lib/types/invoice';
import { mockInvoiceDetail } from '@/lib/mock/invoice';
import { InvoiceActionBar } from '@/app/components/sales/invoices/InvoiceActionBar';
import { InvoiceHeader } from '@/app/components/sales/invoices/InvoiceHeader';
import { CustomerDetails } from '@/app/components/sales/invoices/CustomerDetails';
import { InvoiceItemsTable } from '@/app/components/sales/invoices/InvoiceItemsTable';
import { InvoiceFooter } from '@/app/components/sales/invoices/InvoiceFooter';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>; // now a promise
}


export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<FullInvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchInvoice = async () => {
      try {
        // In real implementation, fetch based on params.id
        // const response = await fetch(`/api/invoices/${params.id}`);
        // const data = await response.json();
        
        // For now, using mock data
        setTimeout(() => {
          setInvoice(mockInvoiceDetail);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleRecordPayment = () => {
    // TODO: Implement record payment dialog
    console.log('Record payment for invoice:', id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600">The requested invoice could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InvoiceActionBar 
        invoice={invoice} 
        onRecordPayment={handleRecordPayment} 
      />
      
      <div className="flex justify-center p-4">
        <Card className="printable-area w-full max-w-4xl bg-white shadow-lg">
          <div className="p-8">
            <InvoiceHeader invoice={invoice} />
            <CustomerDetails customer={invoice.customer} />
            <InvoiceItemsTable items={invoice.items} />
            <InvoiceFooter invoice={invoice} />
          </div>
        </Card>
      </div>
    </div>
  );
}