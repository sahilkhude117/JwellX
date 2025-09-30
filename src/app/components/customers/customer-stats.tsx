// components/customers/CustomerStats.tsx
import React from 'react';
import { GlobalStatsCards } from '@/components/stats-card/GlobalStatsCards';
import { useCustomerStatsHook } from '@/hooks/customers/use-customer-stats';
import { AddCustomerPopover } from './forms/add-customer-popover';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CustomerStatsProps {
  onCustomerAdded?: () => void;
}

export const CustomerStats: React.FC<CustomerStatsProps> = ({ onCustomerAdded }) => {
  const customerStatsHook = useCustomerStatsHook();

  return (
    <GlobalStatsCards
      statsHook={customerStatsHook}
      title="Customers Management"
      showTimePeriods={true}
      addNewPopover={
        <AddCustomerPopover
          onCustomerAdded={onCustomerAdded}
          trigger={
            <Button
              className="bg-black hover:bg-gray-800 text-white cursor-pointer"
              size="lg"
            >
              <Plus size={16} className="mr-2" />
              Add Customer
            </Button>
          }
        />
      }
    />
  );
};