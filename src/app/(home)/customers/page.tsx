'use client';

export type CustomerRowData = {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  address?: {
    city?: string;
    state?: string;
  } | null;
  lifetimeSpend: number; 
  totalOrders: number;
  lastPurchaseDate: string; // ISO Date String
  createdAt: string; // ISO Date String for when they were first added
};

const mockCustomerData: CustomerRowData[] = [
  {
    id: 'cust_1',
    name: 'Priya Mehta',
    email: 'priya.mehta@example.com',
    phone: '9876543211',
    address: { city: 'Mumbai', state: 'Maharashtra' },
    lifetimeSpend: 485500,
    totalOrders: 4,
    lastPurchaseDate: '2025-06-07T10:30:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'cust_2',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@example.com',
    phone: '9876543210',
    address: { city: 'Delhi', state: 'Delhi' },
    lifetimeSpend: 78200,
    totalOrders: 1,
    lastPurchaseDate: '2025-06-06T14:00:00.000Z',
    createdAt: '2025-06-06T14:00:00.000Z',
  },
  {
    id: 'cust_3',
    name: 'Aarav Singh',
    phone: '9123456789',
    address: { city: 'Nagpur', state: 'Maharashtra' },
    lifetimeSpend: 257500,
    totalOrders: 1,
    lastPurchaseDate: '2025-06-05T18:45:00.000Z',
    createdAt: '2024-11-20T12:00:00.000Z',
  },
  {
    id: 'cust_4',
    name: 'Sunita Patil',
    phone: '9988776655',
    email: 'sunita.p@example.com',
    lifetimeSpend: 0,
    totalOrders: 0,
    lastPurchaseDate: '',
    createdAt: '2025-05-10T09:00:00.000Z',
  },
];

// app/customers/page.tsx


import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow } from 'date-fns';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  UserPlus,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Edit,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  city?: string;
  state?: string;
}

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState<CustomerRowData[]>(mockCustomerData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRowData | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<CustomerRowData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>();

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Table columns
  const columns: ColumnDef<CustomerRowData>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div>
            <div className="font-semibold">{customer.name}</div>
            <div className="text-sm text-gray-500">
              {customer.phone}
              {customer.email && (
                <>
                  <br />
                  {customer.email}
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'address',
      header: 'Location',
      cell: ({ row }) => {
        const { address } = row.original;
        if (!address?.city && !address?.state) return 'N/A';
        return `${address?.city || ''}, ${address?.state || ''}`.replace(/^,\s*/, '');
      },
    },
    {
      accessorKey: 'lifetimeSpend',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Lifetime Spend
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.original.lifetimeSpend),
    },
    {
      accessorKey: 'totalOrders',
      header: 'Total Orders',
      cell: ({ row }) => row.original.totalOrders,
    },
    {
      accessorKey: 'lastPurchaseDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Purchase
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.lastPurchaseDate),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  // Navigate to customer profile
                  window.location.href = `/customers/${customer.id}`;
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingCustomer(customer);
                  reset({
                    name: customer.name,
                    email: customer.email || '',
                    phone: customer.phone,
                    city: customer.address?.city || '',
                    state: customer.address?.state || '',
                  });
                  setOpenDialog(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Navigate to POS with customer pre-selected
                  window.location.href = `/sales/pos?customerId=${customer.id}`;
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Start New Sale
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteCustomer(customer)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredCustomers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                name: data.name,
                email: data.email || null,
                phone: data.phone,
                address: {
                  city: data.city,
                  state: data.state,
                },
              }
            : customer
        )
      );
    } else {
      // Add new customer
      const newCustomer: CustomerRowData = {
        id: `cust_${Date.now()}`,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        address: {
          city: data.city,
          state: data.state,
        },
        lifetimeSpend: 0,
        totalOrders: 0,
        lastPurchaseDate: '',
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }

    setOpenDialog(false);
    setEditingCustomer(null);
    reset();
  };

  const handleDelete = () => {
    if (deleteCustomer) {
      setCustomers((prev) => prev.filter((customer) => customer.id !== deleteCustomer.id));
      setDeleteCustomer(null);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex bg-background items-center border rounded-lg p-4 justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            reset();
            setOpenDialog(true);
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = `/customers/${customer.id}`;
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingCustomer(customer);
                        reset({
                          name: customer.name,
                          email: customer.email || '',
                          phone: customer.phone,
                          city: customer.address?.city || '',
                          state: customer.address?.state || '',
                        });
                        setOpenDialog(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = `/sales/pos?customerId=${customer.id}`;
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Start New Sale
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteCustomer(customer)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <div>{customer.phone}</div>
                {customer.email && <div>{customer.email}</div>}
                {customer.address?.city && (
                  <div>{customer.address.city}, {customer.address.state}</div>
                )}
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <strong>Lifetime Spend:</strong> {formatCurrency(customer.lifetimeSpend)}
                </div>
                <div>
                  <strong>Last Purchase:</strong> {formatDate(customer.lastPurchaseDate)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer 
                ? 'Update customer information here.' 
                : 'Add a new customer to your database.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <span className="col-span-4 text-sm text-red-600">
                    {errors.name.message}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  className="col-span-3"
                  {...register('phone', { required: 'Phone is required' })}
                />
                {errors.phone && (
                  <span className="col-span-4 text-sm text-red-600">
                    {errors.phone.message}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  {...register('email')}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  className="col-span-3"
                  {...register('city')}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input
                  id="state"
                  className="col-span-3"
                  {...register('state')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingCustomer ? 'Save Changes' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <strong>{deleteCustomer?.name}</strong> and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerManagementPage;