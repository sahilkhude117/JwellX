'use client'

import { useState } from 'react';
import { CustomerStats } from "@/app/components/customers/customer-stats";
import { CustomerTable } from "@/app/components/customers/tables/customer-table";
import { EditCustomerPopover } from "@/app/components/customers/forms/edit-customer-popover";
import { ViewCustomerPopover } from "@/app/components/customers/forms/view-customer-popover";
import { CustomerWithStats } from "@/lib/types/customers/customers";

export default function CustomersPage() {
  const [editCustomerState, setEditCustomerState] = useState<{
    isOpen: boolean;
    customer: CustomerWithStats | null;
  }>({
    isOpen: false,
    customer: null,
  });
  const [viewCustomerState, setViewCustomerState] = useState<{
    isOpen: boolean;
    customer: CustomerWithStats | null;
  }>({
    isOpen: false,
    customer: null,
  });

  const handleCreateNew = () => {
    // This is used by the table's add button
    // The stats component handles its own popover
  };

  const handleEditCustomer = (customer: CustomerWithStats) => {
    setEditCustomerState({
      isOpen: true,
      customer,
    });
  };

  const handleViewCustomer = (customer: CustomerWithStats) => {
    setViewCustomerState({
      isOpen: true,
      customer,
    });
  };

  const handleCustomerAdded = () => {
    // Table will automatically refresh due to query invalidation
  };

  const handleCustomerUpdated = () => {
    setEditCustomerState({
      isOpen: false,
      customer: null,
    });
    // Table will automatically refresh due to query invalidation
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Statistics Section */}
      <div className="mb-8">
        <CustomerStats onCustomerAdded={handleCustomerAdded} />
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <CustomerTable
            onCreateNew={handleCreateNew}
            onEditCustomer={handleEditCustomer}
            onViewCustomer={handleViewCustomer}
          />
        </div>
      </div>

      {/* Modals and Popovers */}

      <EditCustomerPopover
        customerId={editCustomerState.customer?.id || ''}
        customer={editCustomerState.customer || undefined}
        open={editCustomerState.isOpen}
        onOpenChange={(open: boolean) => setEditCustomerState({ isOpen: open, customer: open ? editCustomerState.customer : null })}
        onCustomerUpdated={handleCustomerUpdated}
        trigger={<div style={{ display: 'none' }} />}
      />

      <ViewCustomerPopover
        customerId={viewCustomerState.customer?.id || ''}
        customer={viewCustomerState.customer || undefined}
        open={viewCustomerState.isOpen}
        onOpenChange={(open: boolean) => setViewCustomerState({ isOpen: open, customer: open ? viewCustomerState.customer : null })}
        trigger={<div style={{ display: 'none' }} />}
      />
    </div>
  );
}
