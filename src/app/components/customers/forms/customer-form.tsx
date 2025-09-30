'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, User, Phone, Mail, MapPin } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { customerFormSchema, CustomerFormData } from '@/lib/validations/customers';
import { CustomerWithStats } from '@/lib/types/customers/customers';

interface CustomerFormProps {
  customer?: CustomerWithStats;
  onSubmit: (data: CustomerFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Save Customer'
}) => {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || '',
      phoneNumber: customer?.phoneNumber || '',
      email: customer?.email || '',
      address: customer?.address || '',
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter customer name"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter phone number"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
                <span className="text-xs text-gray-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
                <span className="text-xs text-gray-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter customer address"
                  rows={3}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitText}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};