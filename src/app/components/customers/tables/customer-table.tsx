'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/data-table';
import { TableAction, BulkAction, FilterConfig } from '@/components/data-table/types';
import { createCustomerColumns } from './customer-columns';
import { AddCustomerPopover } from '../forms/add-customer-popover';
import { EditCustomerPopover } from '../forms/edit-customer-popover';
import { ViewCustomerPopover } from '../forms/view-customer-popover';
import { useCustomerTable } from '@/hooks/customers/use-customer-table';
import { useDeleteCustomer, useBulkDeleteCustomers, useCustomerLookups } from '@/hooks/customers/use-customers';
import { CustomerWithStats } from '@/lib/types/customers/customers';
import { BaseDeleteConfig } from '@/components/GlobalDeleteConfirmDialog';
import GlobalDeleteConfirmationDialog from '@/components/GlobalDeleteConfirmDialog';

interface CustomerTableProps {
  onCreateNew?: () => void;
  onViewCustomer?: (customer: CustomerWithStats) => void;
  onEditCustomer?: (customer: CustomerWithStats) => void;
}

const deleteCustomerConfig = {
  customer: (name: string, isBulk = false, count = 1): BaseDeleteConfig => ({
    title: isBulk ? "Delete Customers" : "Delete Customer",
    description: isBulk 
      ? `Are you sure you want to delete ${count} selected customers?`
      : `Are you sure you want to delete "${name}"?`,
    itemName: isBulk ? `${count} customers` : name,
    itemType: isBulk ? "customers" : "customer",
    confirmButtonText: isBulk ? "Delete Customers" : "Delete Customer",
  }),
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  onCreateNew,
  onViewCustomer,
  onEditCustomer,
}) => {
  const router = useRouter();
  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    config: any;
    onConfirm: () => void;
  }>({
    isOpen: false,
    config: null,
    onConfirm: () => {}
  });

  // Add state for view customer popover
  const [viewCustomerState, setViewCustomerState] = useState<{
    isOpen: boolean;
    customerId: string | null;
  }>({
    isOpen: false,
    customerId: null,
  });

  // Add state for edit customer popover
  const [editCustomerState, setEditCustomerState] = useState<{
    isOpen: boolean;
    customer: CustomerWithStats | null;
  }>({
    isOpen: false,
    customer: null,
  });

  const {
    data,
    totalCount,
    currentPage,
    pageSize,
    loading,
    error,
    onPageChange,
    onPageSizeChange,
    onFiltersChange,
  } = useCustomerTable();

  const { data: lookups } = useCustomerLookups();
  const deleteCustomerMutation = useDeleteCustomer();
  const bulkDeleteCustomersMutation = useBulkDeleteCustomers();

  const handleViewCustomer = (customer: CustomerWithStats) => {
    if (onViewCustomer) {
      onViewCustomer(customer);
    } else {
      setViewCustomerState({
        isOpen: true,
        customerId: customer.id,
      });
    }
  };

  const columns = createCustomerColumns(handleViewCustomer);

  // Table actions
  const actions: TableAction<CustomerWithStats>[] = [
    {
      label: "View Details",
      onClick: (customer) => handleViewCustomer(customer),
      variant: "ghost",
    },
    {
      label: "Edit",
      onClick: (customer) => {
        if (onEditCustomer) {
          onEditCustomer(customer);
        } else {
          setEditCustomerState({
            isOpen: true,
            customer,
          });
        }
      },
      variant: "ghost",
    },
    {
      label: "Delete",
      onClick: (customer) => {
        setDeleteConfig({
          isOpen: true,
          config: deleteCustomerConfig.customer(customer.name),
          onConfirm: () => deleteCustomerMutation.mutate(customer.id)
        });
      },
      variant: "destructive",
      disabled: (customer) => customer.totalPurchases > 0, // Can't delete customers with purchase history
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<CustomerWithStats>[] = [
    {
      label: "Delete Selected",
      onClick: (selectedCustomers) => {
        const validCustomers = selectedCustomers.filter(customer => customer.totalPurchases === 0);
        
        if (validCustomers.length === 0) {
          // Show error message that customers with purchases can't be deleted
          return;
        }

        setDeleteConfig({
          isOpen: true,
          config: deleteCustomerConfig.customer("", true, validCustomers.length),
          onConfirm: () => bulkDeleteCustomersMutation.mutate(validCustomers.map(c => c.id))
        });
      },
      variant: "destructive",
    },
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      key: "search",
      label: "Search",
      type: "search",
      placeholder: "Search by name, phone, or email...",
    },
    {
      key: "isActive",
      label: "Status",
      type: "select",
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ],
      defaultValue: "all",
    },
    {
      key: "dateRange",
      label: "Registration Date",
      type: "date-range",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        totalCount={totalCount}
        loading={loading}
        filters={filters}
        actions={actions}
        bulkActions={bulkActions}
        emptyState={{
          title: "No customers found",
          description: "Start by adding your first customer",
          action: onCreateNew ? {
            label: "Add Customer",
            onClick: onCreateNew
          } : undefined
        }}
        enableSorting={true}
        enableSelection={true}
        enablePagination={true}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onFiltersChange={onFiltersChange}
      />

      {/* Delete Confirmation Dialog */}
      <GlobalDeleteConfirmationDialog
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          deleteConfig.onConfirm();
          setDeleteConfig(prev => ({ ...prev, isOpen: false }));
        }}
        config={deleteConfig.config}
        isLoading={deleteCustomerMutation.isPending || bulkDeleteCustomersMutation.isPending}
      />

      {/* View Customer Popover */}
      <ViewCustomerPopover
        customerId={viewCustomerState.customerId || ''}
        open={viewCustomerState.isOpen}
        onOpenChange={(open: boolean) => setViewCustomerState({ isOpen: open, customerId: open ? viewCustomerState.customerId : null })}
        trigger={<div style={{ display: 'none' }} />}
      />

      {/* Edit Customer Popover */}
      <EditCustomerPopover
        customerId={editCustomerState.customer?.id || ''}
        customer={editCustomerState.customer || undefined}
        open={editCustomerState.isOpen}
        onOpenChange={(open: boolean) => setEditCustomerState({ isOpen: open, customer: open ? editCustomerState.customer : null })}
        trigger={<div style={{ display: 'none' }} />}
        onCustomerUpdated={() => setEditCustomerState({ isOpen: false, customer: null })}
      />
    </>
  );
};