import { ColumnDef } from '@tanstack/react-table';
import { CustomerWithStats } from '@/lib/types/customers/customers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowUpDown } from 'lucide-react';
import { 
  formatPhoneNumber, 
  getCustomerActivityStatus, 
  getCustomerValueTier,
  getCustomerInitials 
} from '@/lib/utils/customers/customer-utils';
import { formatDistanceToNow } from 'date-fns';

export const createCustomerColumns = (
  onViewCustomer: (customer: CustomerWithStats) => void
): ColumnDef<CustomerWithStats>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Customer
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const customer = row.original;
      const initials = getCustomerInitials(customer.name);
      const { tier, color } = getCustomerValueTier(customer.totalSpent);
      
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span 
                className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onViewCustomer(customer)}
              >
                {customer.name}
              </span>
              {tier !== 'New' && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    color === 'purple' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                    color === 'blue' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                    'border-gray-200 text-gray-700 bg-gray-50'
                  }`}
                >
                  {tier}
                </Badge>
              )}
            </div>
            {customer.email && (
              <span className="text-sm text-gray-500">{customer.email}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
    cell: ({ row }) => {
      const phoneNumber = row.original.phoneNumber;
      return (
        <span className={phoneNumber ? 'text-gray-900' : 'text-gray-400'}>
          {formatPhoneNumber(phoneNumber)}
        </span>
      );
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const address = row.original.address;
      return (
        <span className={address ? 'text-gray-900' : 'text-gray-400'}>
          {address || 'N/A'}
        </span>
      );
    },
  },
  {
    accessorKey: 'totalPurchases',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Purchases
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const purchases = row.original.totalPurchases;
      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{purchases}</span>
          <span className="text-sm text-gray-500">
            {purchases === 1 ? 'order' : 'orders'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalSpent',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Total Spent
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.original.totalSpent;
      return (
        <span className="font-medium">
          ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      );
    },
  },
  {
    accessorKey: 'lastPurchaseDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Last Purchase
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.lastPurchaseDate;
      if (!date) {
        return <span className="text-gray-400">Never</span>;
      }
      
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(date).toLocaleDateString('en-IN')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const customer = row.original;
      const { status, color } = getCustomerActivityStatus(customer);
      
      return (
        <Badge 
          variant="outline"
          className={`${
            color === 'green' ? 'border-green-200 text-green-700 bg-green-50' :
            'border-gray-200 text-gray-700 bg-gray-50'
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
];