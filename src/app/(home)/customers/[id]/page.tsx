'use client';

// types/customer.ts (extended types)
export type PurchaseHistoryItem = {
  invoiceId: string;
  invoiceNumber: string;
  date: string; // ISO Date String
  status: 'PAID' | 'PENDING' | 'PARTIAL';
  amount: number;
};

export type CustomOrderItem = {
  orderId: string;
  orderNumber: string;
  date: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
};

export type FullCustomerDetails = {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  address: string;
  createdAt: string; // "Member Since" date
  
  // Key calculated metrics
  analytics: {
    lifetimeSpend: number;
    totalOrders: number;
    avgOrderValue: number;
    lastPurchaseDate: string;
  };
  
  // Detailed historical data
  purchaseHistory: PurchaseHistoryItem[];
  customOrderHistory: CustomOrderItem[];
  
  // For personal notes
  notes?: string | null;
};

// mock/data.ts (extended mock data)
export const mockCustomerDetail: FullCustomerDetails = {
  id: 'cust_1',
  name: 'Priya Mehta',
  email: 'priya.mehta@example.com',
  phone: '9876543211',
  address: 'A-1201, Oberoi Towers, Lokhandwala, Andheri (W), Mumbai, 400053',
  createdAt: '2024-01-15T10:00:00.000Z',
  analytics: {
    lifetimeSpend: 485500,
    totalOrders: 4,
    avgOrderValue: 121375,
    lastPurchaseDate: '2025-06-07T10:30:00.000Z',
  },
  purchaseHistory: [
    { invoiceId: 'inv_101', invoiceNumber: 'INV-2025-001', date: '2025-06-07T10:30:00.000Z', status: 'PAID', amount: 125500 },
    { invoiceId: 'inv_095', invoiceNumber: 'INV-2025-04-021', date: '2025-04-20T16:15:00.000Z', status: 'PAID', amount: 80000 },
    { invoiceId: 'inv_080', invoiceNumber: 'INV-2025-02-010', date: '2025-02-10T12:00:00.000Z', status: 'PAID', amount: 250000 },
    { invoiceId: 'inv_050', invoiceNumber: 'INV-2024-01-005', date: '2024-01-15T10:00:00.000Z', status: 'PAID', amount: 30000 },
  ],
  customOrderHistory: [
    { orderId: 'ord_22', orderNumber: 'ORD-C-022', date: '2025-05-10T11:00:00.000Z', status: 'COMPLETED', description: 'Custom engagement ring' },
  ],
  notes: 'Prefers minimalist designs in white gold. Anniversary is on March 15th. Inquired about sapphire pendants in last visit.',
};

// app/dashboard/customers/[id]/page.tsx


import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Eye,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  User,
  Save,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  address: string;
}

const CustomerDetailPage = () => {
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<FullCustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    // Simulate API call
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        // In real app: const response = await fetch(`/api/customers/${customerId}`);
        // For now, use mock data
        setTimeout(() => {
          setCustomer(mockCustomerDetail);
          setNotes(mockCustomerDetail.notes || '');
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveNotes = async () => {
    try {
      // In real app: await fetch(`/api/customers/${customerId}`, { method: 'PATCH', body: JSON.stringify({ notes }) });
      
      // Update local state
      if (customer) {
        setCustomer({ ...customer, notes });
      }
      
      toast({
        title: "Notes saved",
        description: "Customer notes have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCustomer = () => {
    if (customer) {
      setEditFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address,
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (customer) {
      // Update customer data
      setCustomer({
        ...customer,
        name: editFormData.name,
        email: editFormData.email || null,
        phone: editFormData.phone,
        address: editFormData.address,
      });
      
      setEditDialogOpen(false);
      toast({
        title: "Customer updated",
        description: "Customer information has been updated successfully.",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
          <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back Navigation */}
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer ID: {customer.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditCustomer}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button onClick={() => window.location.href = `/dashboard/sales/pos?customerId=${customer.id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Start New Sale
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="purchases" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchases">Purchase History</TabsTrigger>
              <TabsTrigger value="orders">Custom Orders</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            {/* Purchase History Tab */}
            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.purchaseHistory.map((purchase) => (
                          <TableRow key={purchase.invoiceId}>
                            <TableCell>
                              <Button
                                variant="link"
                                className="p-0 h-auto font-medium"
                                onClick={() => window.location.href = `/dashboard/invoices/${purchase.invoiceId}`}
                              >
                                {purchase.invoiceNumber}
                              </Button>
                            </TableCell>
                            <TableCell>{formatDate(purchase.date)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(purchase.status)}>
                                {purchase.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/dashboard/invoices/${purchase.invoiceId}`}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {customer.purchaseHistory.map((purchase) => (
                      <Card key={purchase.invoiceId}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{purchase.invoiceNumber}</p>
                              <p className="text-sm text-gray-600">{formatDate(purchase.date)}</p>
                            </div>
                            <Badge className={getStatusColor(purchase.status)}>
                              {purchase.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-semibold">{formatCurrency(purchase.amount)}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/dashboard/invoices/${purchase.invoiceId}`}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Custom Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.customOrderHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No custom orders found</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order #</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customer.customOrderHistory.map((order) => (
                              <TableRow key={order.orderId}>
                                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                <TableCell>{formatDate(order.date)}</TableCell>
                                <TableCell>{order.description}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden space-y-4">
                        {customer.customOrderHistory.map((order) => (
                          <Card key={order.orderId}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{order.orderNumber}</p>
                                  <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                                </div>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm">{order.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add notes about this customer's preferences, special requests, or important information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button onClick={handleSaveNotes}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Snapshot Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{customer.email}</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <span className="text-sm">{customer.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Customer Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lifetime Spend</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(customer.analytics.lifetimeSpend)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-semibold">{customer.analytics.totalOrders}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Order Value</span>
                  <span className="font-semibold">
                    {formatCurrency(customer.analytics.avgOrderValue)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Purchase</span>
                  <span className="font-semibold text-sm">
                    {customer.analytics.lastPurchaseDate 
                      ? formatRelativeDate(customer.analytics.lastPurchaseDate)
                      : 'Never'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-semibold text-sm">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone *
              </Label>
              <Input
                id="edit-phone"
                className="col-span-3"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                className="col-span-3"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Address
              </Label>
              <Textarea
                id="edit-address"
                className="col-span-3"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDetailPage;