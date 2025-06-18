'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import { mockCustomers } from '@/lib/mock/order';
import { Customer, CreateCustomOrderData } from '@/lib/types/orders';

interface NewCustomOrderDialogProps {
  onOrderCreate: (orderData: any) => void;
}

export function NewCustomOrderDialog({ onOrderCreate }: NewCustomOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateCustomOrderData>();

  const totalAmount = watch('totalAmount');
  const advancePayment = watch('advancePayment');

  const onSubmit = async (data: CreateCustomOrderData) => {
    if (!selectedCustomer || !deliveryDate) return;

    const orderData = {
      customer: selectedCustomer,
      description: data.description,
      totalAmount: Number(data.totalAmount),
      advancePaid: Number(data.advancePayment),
      expectedDeliveryDate: deliveryDate.toISOString(),
    };

    onOrderCreate(orderData);
    
    // Reset form and close dialog
    reset();
    setSelectedCustomer(null);
    setDeliveryDate(undefined);
    setOpen(false);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer.id);
    setCustomerOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Create New Custom Order</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label htmlFor="customer">Customer *</Label>
          <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={customerOpen}
                className="w-full justify-between"
                type="button"
              >
                {selectedCustomer
                  ? `${selectedCustomer.name} - ${selectedCustomer.phone}`
                  : "Select customer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search customers..." />
                <CommandEmpty>No customer found.</CommandEmpty>
                <CommandGroup>
                  {mockCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={`${customer.name} ${customer.phone}`}
                      onSelect={() => handleCustomerSelect(customer)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {!selectedCustomer && (
            <p className="text-sm text-destructive">Please select a customer</p>
          )}
        </div>

        {/* Order Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Order Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the custom work in detail..."
            {...register('description', { 
              required: 'Order description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' }
            })}
            className="min-h-[100px]"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Total Amount */}
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Estimated Total Amount (₹) *</Label>
          <Input
            id="totalAmount"
            type="number"
            placeholder="0"
            {...register('totalAmount', { 
              required: 'Total amount is required',
              min: { value: 1, message: 'Amount must be greater than 0' }
            })}
          />
          {errors.totalAmount && (
            <p className="text-sm text-destructive">{errors.totalAmount.message}</p>
          )}
        </div>

        {/* Advance Payment */}
        <div className="space-y-2">
          <Label htmlFor="advancePayment">Advance Payment (₹)</Label>
          <Input
            id="advancePayment"
            type="number"
            placeholder="0"
            {...register('advancePayment', { 
              min: { value: 0, message: 'Advance payment cannot be negative' },
              validate: (value) => {
                if (totalAmount && Number(value) > Number(totalAmount)) {
                  return 'Advance payment cannot exceed total amount';
                }
                return true;
              }
            })}
          />
          {errors.advancePayment && (
            <p className="text-sm text-destructive">{errors.advancePayment.message}</p>
          )}
        </div>

        {/* Expected Delivery Date */}
        <div className="space-y-2">
          <Label>Expected Delivery Date *</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !deliveryDate && "text-muted-foreground"
                )}
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={deliveryDate}
                onSelect={(date) => {
                  setDeliveryDate(date);
                  setCalendarOpen(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {!deliveryDate && (
            <p className="text-sm text-destructive">Please select an expected delivery date</p>
          )}
        </div>

        {/* Payment Summary */}
        {totalAmount && advancePayment && (
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Advance Payment:</span>
                <span className="font-medium">₹{Number(advancePayment).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Remaining:</span>
                <span className="font-medium">₹{(Number(totalAmount) - Number(advancePayment)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setSelectedCustomer(null);
              setDeliveryDate(undefined);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedCustomer || !deliveryDate}
          >
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}