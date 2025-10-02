'use client'

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CustomerForm } from './customer-form';
import { useCreateCustomer } from '@/hooks/customers/use-customers';
import { CustomerFormData } from '@/lib/validations/customers';

interface AddCustomerPopoverProps {
  onCustomerAdded?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddCustomerPopover: React.FC<AddCustomerPopoverProps> = ({
  onCustomerAdded,
  trigger,
  open,
  onOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const createCustomerMutation = useCreateCustomer();
  
  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync({
        name: data.name,
        phoneNumber: data.phoneNumber || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
      });
      
      setIsOpen(false);
      onCustomerAdded?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <button style={{ display: 'none' }} />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-6" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Add New Customer</h3>
            <p className="text-sm text-gray-600">
              Create a new customer profile
            </p>
          </div>
          
          <CustomerForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={createCustomerMutation.isPending}
            submitText="Add Customer"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};