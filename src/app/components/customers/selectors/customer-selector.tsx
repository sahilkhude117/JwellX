"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { AddCustomerPopover } from "../forms/add-customer-popover";
import { useCustomers } from "@/hooks/customers/use-customers";
import { CustomerWithStats } from "@/lib/types/customers/customers";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
  onCustomerCreated?: (customer: CustomerWithStats) => void;
  onCustomerSelected?: (customer: CustomerWithStats | null) => void;
  showAddNew?: boolean;
}

export interface CustomerSelectorRef {
  triggerAddCustomer: () => void;
}

const CustomerSelector = forwardRef<CustomerSelectorRef, CustomerSelectorProps>(({
  value,
  onChange,
  required = false,
  className = "",
  width = 320,
  disabled = false,
  showBadge = true,
  onCustomerCreated,
  onCustomerSelected,
  showAddNew = true
}, ref) => {
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const {
    data: customersData,
    isLoading: isLoading,
    error: error,
    refetch: refetch
  } = useCustomers();
  
  const customers = customersData?.customers || [];
  
  const handleAddNewCustomer = () => {
    setIsAddCustomerOpen(true);
  };

  // Expose the add customer function via ref
  useImperativeHandle(ref, () => ({
    triggerAddCustomer: handleAddNewCustomer
  }));

  const handleCustomerAdded = () => {
    refetch();
    setIsAddCustomerOpen(false);
  };
  
  const handleSelect = (customerId: string) => {
    onChange(customerId);
    
    // Find and pass the selected customer to the callback
    const selectedCustomer = customers.find(c => c.id === customerId) || null;
    onCustomerSelected?.(selectedCustomer);
  };
  
  return (
    <div className="flex items-center gap-0">
      <div className="flex-1">
        <ContextualSelector<CustomerWithStats>
          items={customers}
          isLoading={isLoading}
          error={error ? new Error(error.message || 'Failed to load customers') : null}
          refetch={refetch}
          selectedValue={value}
          onSelect={handleSelect}
          getItemId={(customer) => customer.id}
          getItemName={(customer) => customer.name}
          getItemDescription={(customer) => {
            const parts = [];
            if (customer.phoneNumber) parts.push(customer.phoneNumber);
            if (customer.totalPurchases > 0) parts.push(`${customer.totalPurchases} purchases`);
            return parts.length > 0 ? parts.join(' • ') : null;
          }}
          placeholder={required ? "Select customer" : "Select customer"}
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found."
          addItemLabel="+"
          disabled={disabled}
          width={`w-[${width}px]`}
          badgeVariant="secondary"
          showBadge={false}
          className={className}
          showAddNew={false}
          onAddNew={handleAddNewCustomer}
        />
      </div>
      
      <AddCustomerPopover
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onCustomerAdded={handleCustomerAdded}
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 bg-black text-white hover:bg-gray-800 border-black ml-2 flex-shrink-0"
            onClick={() => setIsAddCustomerOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
});

CustomerSelector.displayName = 'CustomerSelector';

export default CustomerSelector;