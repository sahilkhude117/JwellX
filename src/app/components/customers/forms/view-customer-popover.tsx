'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Eye, Loader2, User, Phone, Mail, MapPin, Calendar, ShoppingBag } from 'lucide-react';
import { useCustomer } from '@/hooks/customers/use-customers';
import { CustomerWithStats } from '@/lib/types/customers/customers';
import {
  formatPhoneNumber,
  getCustomerActivityStatus,
  getCustomerValueTier,
  getCustomerInitials,
  generateCustomerInsights
} from '@/lib/utils/customers/customer-utils';
import { formatDistanceToNow } from 'date-fns';

interface ViewCustomerPopoverProps {
  customerId: string;
  customer?: CustomerWithStats;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ViewCustomerPopover: React.FC<ViewCustomerPopoverProps> = ({
  customerId,
  customer: initialCustomer,
  trigger,
  open,
  onOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  // Fetch customer data if not provided
  const { data: fetchedCustomerData, isLoading: isLoadingCustomer } = useCustomer(customerId);
  const customer = initialCustomer || fetchedCustomerData?.customer;

  // Don't return null if we're supposed to be open - show loading state instead
  if (!customer && !isLoadingCustomer && !isOpen) {
    return null;
  }

  const insights = customer ? generateCustomerInsights(customer) : [];
  const { status, color: statusColor } = customer ? getCustomerActivityStatus(customer) : { status: 'Unknown', color: 'gray' };
  const { tier, color: tierColor } = customer ? getCustomerValueTier(customer.totalSpent) : { tier: 'New', color: 'gray' };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-96 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        {isLoadingCustomer ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : customer ? (
          <div className="space-y-0">
            {/* Header */}
            <div className="px-6 pb-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-medium">
                    {getCustomerInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{customer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            statusColor === 'green' ? 'border-green-200 text-green-700 bg-green-50' :
                            'border-gray-200 text-gray-700 bg-gray-50'
                          }`}
                        >
                          {status}
                        </Badge>
                        {tier !== 'New' && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              tierColor === 'purple' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                              tierColor === 'blue' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                              'border-gray-200 text-gray-700 bg-gray-50'
                            }`}
                          >
                            {tier}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="p-6 py-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className={customer.phoneNumber ? 'text-gray-900' : 'text-gray-400'}>
                    {formatPhoneNumber(customer.phoneNumber)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className={customer.email ? 'text-gray-900' : 'text-gray-400'}>
                    {customer.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className={customer.address ? 'text-gray-900' : 'text-gray-400'}>
                    {customer.address || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Purchase Summary */}
            <div className="p-6 py-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Purchase Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{customer.totalPurchases}</div>
                  <div className="text-xs text-gray-500">
                    {customer.totalPurchases === 1 ? 'Purchase' : 'Purchases'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{customer.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500">Total Spent</div>
                </div>
              </div>
              
              {customer.lastPurchaseDate && (
                <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last purchase: {formatDistanceToNow(new Date(customer.lastPurchaseDate), { addSuffix: true })}
                </div>
              )}
            </div>

            <Separator />

            {/* Customer Insights */}
            {insights.length > 0 && (
              <div className="p-6 py-4">
                <h4 className="font-medium mb-3">Insights</h4>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Registration Date */}
            <div className="p-6 pt-4">
              <div className="text-sm text-gray-600">
                Customer since {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Customer not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};