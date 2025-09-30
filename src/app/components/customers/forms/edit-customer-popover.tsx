'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import { CustomerForm } from './customer-form';
import { useUpdateCustomer, useCustomer } from '@/hooks/customers/use-customers';
import { CustomerFormData } from '@/lib/validations/customers';
import { CustomerWithStats } from '@/lib/types/customers/customers';

interface EditCustomerPopoverProps {
  customerId: string;
  customer?: CustomerWithStats;
  onCustomerUpdated?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EditCustomerPopover: React.FC<EditCustomerPopoverProps> = ({
  customerId,
  customer: initialCustomer,
  onCustomerUpdated,
  trigger,
  open,
  onOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const updateCustomerMutation = useUpdateCustomer();
  
  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  // Fetch customer data if not provided
  const { data: fetchedCustomerData, isLoading: isLoadingCustomer } = useCustomer(customerId);
  const customer = initialCustomer || fetchedCustomerData?.customer;

  // Don't return null if we're supposed to be open - show loading state instead

  const handleSubmit = async (data: CustomerFormData) => {
    if (!customer) return;
    
    try {
      await updateCustomerMutation.mutateAsync({
        id: customer.id,
        data: {
          name: data.name,
          phoneNumber: data.phoneNumber || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
        }
      });
      
      setIsOpen(false);
      onCustomerUpdated?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-96 p-6">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Update customer information
            </p>
          </div>
          
          {isLoadingCustomer ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : customer ? (
            <CustomerForm
              customer={customer}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={updateCustomerMutation.isPending}
              submitText="Update Customer"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Customer not found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};