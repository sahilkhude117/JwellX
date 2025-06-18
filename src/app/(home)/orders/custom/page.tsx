'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  CreditCard, 
  FileText, 
  XCircle,
  ChevronDown,
  Filter,
  ArrowUpDown
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

import { CustomOrderRowData, CustomOrderStatus, statusColors } from '@/lib/types/orders';
import { mockCustomOrders } from '@/lib/mock/order';

// Components
import { NewCustomOrderDialog } from '@/app/components/orders/new-customer-order';
import { UpdateStatusDialog } from '@/app/components/orders/update-status-dialog';
import { RecordPaymentDialog } from '@/app/components/orders/record-payment-dialogue';

export default function CustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrderRowData[]>(mockCustomOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomOrderStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<keyof CustomOrderRowData>('orderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'orderDate' || sortField === 'expectedDeliveryDate') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (sortField === 'customer') {
        aValue = (a.customer as any).name;
        bValue = (b.customer as any).name;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortField, sortDirection]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = orders.length;
    const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
    const pending = orders.filter(o => o.status === 'ADVANCE_PENDING').length;
    const ready = orders.filter(o => o.status === 'READY_FOR_DELIVERY').length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalAdvance = orders.reduce((sum, o) => sum + o.advancePaid, 0);

    return { total, inProgress, pending, ready, totalValue, totalAdvance };
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const handleSort = (field: keyof CustomOrderRowData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: CustomOrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const recordPayment = (orderId: string, amount: number) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, advancePaid: Math.min(order.advancePaid + amount, order.totalAmount) }
        : order
    ));
  };

  const addNewOrder = (orderData: any) => {
    const newOrder: CustomOrderRowData = {
      id: `ord_c_${Date.now()}`,
      orderNumber: `ORD-C-25-${String(orders.length + 1).padStart(3, '0')}`,
      ...orderData,
      orderDate: new Date().toISOString(),
      status: 'QUOTED' as CustomOrderStatus,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Orders</h1>
          <p className="text-muted-foreground">
            Manage your custom jewelry orders and track production progress
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Custom Order
            </Button>
          </DialogTrigger>
          <NewCustomOrderDialog onOrderCreate={addNewOrder} />
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
            <p className="text-xs text-muted-foreground">
              Active custom orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently being crafted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting advance payment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.ready}</div>
            <p className="text-xs text-muted-foreground">
              Completed orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CustomOrderStatus | 'ALL')}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="QUOTED">Quoted</SelectItem>
            <SelectItem value="ADVANCE_PENDING">Advance Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
            <SelectItem value="READY_FOR_DELIVERY">Ready for Delivery</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('orderNumber')}
                >
                  <div className="flex items-center gap-2">
                    Order #
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-2">
                    Customer
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('orderDate')}
                >
                  <div className="flex items-center gap-2">
                    Dates
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link 
                      href={`/dashboard/orders/custom/${order.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Ordered:</span> {formatDate(order.orderDate)}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Delivery:</span> {formatDate(order.expectedDeliveryDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="text-sm">
                        {formatCurrency(order.advancePaid)} / {formatCurrency(order.totalAmount)}
                      </div>
                      <Progress 
                        value={(order.advancePaid / order.totalAmount) * 100} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/orders/custom/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <ArrowUpDown className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <UpdateStatusDialog 
                            order={order}
                            onStatusUpdate={updateOrderStatus}
                          />
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <RecordPaymentDialog 
                            order={order}
                            onPaymentRecord={recordPayment}
                          />
                        </Dialog>
                        {order.status === 'READY_FOR_DELIVERY' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/pos?orderId=${order.id}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Final Invoice
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="font-medium">{order.customer.name}</div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[order.status]}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/orders/custom/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <UpdateStatusDialog 
                          order={order}
                          onStatusUpdate={updateOrderStatus}
                        />
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <RecordPaymentDialog 
                          order={order}
                          onPaymentRecord={recordPayment}
                        />
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>{order.description}</div>
                <div className="font-medium text-foreground">{order.orderNumber}</div>
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payment:</span>
                  <span>{formatCurrency(order.advancePaid)} / {formatCurrency(order.totalAmount)}</span>
                </div>
                <Progress 
                  value={(order.advancePaid / order.totalAmount) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              No orders found matching your criteria.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}