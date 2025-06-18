'use client'
import React, { useState } from 'react';
import { Calendar, User, Upload, Plus, Eye, Download, CreditCard, Clock, CheckCircle, AlertCircle, DollarSign, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Type definitions
type CustomOrderStatus = 'QUOTED' | 'ADVANCE_PENDING' | 'IN_PROGRESS' | 'READY_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';

type StatusHistoryEntry = {
  status: CustomOrderStatus;
  date: string;
  updatedBy: string;
};

type ImageAsset = {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
};

type InternalNote = {
  id: string;
  note: string;
  author: string;
  createdAt: string;
};

type FullCustomOrderDetails = {
  id: string;
  orderNumber: string;
  customer: { id: string; name: string; };
  status: CustomOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  fullDescription: string;
  
  financials: {
    totalAmount: number;
    advancePaid: number;
    amountDue: number;
    paymentHistory: { date: string; amount: number; method: string }[];
  };

  statusHistory: StatusHistoryEntry[];
  imageGallery: ImageAsset[];
  internalNotes: InternalNote[];
};

// Mock data
const mockCustomOrderDetail: FullCustomOrderDetails = {
  id: 'ord_c_1',
  orderNumber: 'ORD-C-25-001',
  customer: { id: 'cust_1', name: 'Priya Mehta' },
  status: 'IN_PROGRESS',
  orderDate: '2025-06-15T11:00:00.000Z',
  expectedDeliveryDate: '2025-07-15T18:00:00.000Z',
  fullDescription: 'Custom platinum engagement ring with a 1.2ct emerald cut, VVS1, G-color diamond. Band to be 2mm wide, knife-edge style. Finger size is US 6.5. GIA certification required.',
  financials: {
    totalAmount: 450000,
    advancePaid: 200000,
    amountDue: 250000,
    paymentHistory: [
      { date: '2025-06-15T11:05:00.000Z', amount: 200000, method: 'BANK_TRANSFER' },
    ],
  },
  statusHistory: [
    { status: 'QUOTED', date: '2025-06-15T10:30:00.000Z', updatedBy: 'Amit Kumar' },
    { status: 'ADVANCE_PENDING', date: '2025-06-15T10:31:00.000Z', updatedBy: 'Amit Kumar' },
    { status: 'IN_PROGRESS', date: '2025-06-16T12:00:00.000Z', updatedBy: 'Artisan_John' },
  ],
  imageGallery: [
    { id: 'img1', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop', caption: 'Initial customer sketch', uploadedAt: '2025-06-15T11:00:00.000Z' },
    { id: 'img2', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop', caption: 'CAD Render for approval', uploadedAt: '2025-06-17T15:00:00.000Z' },
    { id: 'img3', url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=300&fit=crop', caption: 'Wax model progress', uploadedAt: '2025-06-18T14:00:00.000Z' },
  ],
  internalNotes: [
    { id: 'note1', note: 'Customer confirmed CAD render via WhatsApp. Proceeding with wax model.', author: 'Priya Mehta', createdAt: '2025-06-18T10:00:00.000Z' },
    { id: 'note2', note: 'Diamond sourced from certified supplier. GIA certificate attached to order file.', author: 'Amit Kumar', createdAt: '2025-06-17T16:30:00.000Z' },
  ],
};

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusVariant = (status: CustomOrderStatus) => {
  const variants = {
    'QUOTED': 'secondary' as const,
    'ADVANCE_PENDING': 'outline' as const,
    'IN_PROGRESS': 'default' as const,
    'READY_FOR_DELIVERY': 'secondary' as const,
    'COMPLETED': 'secondary' as const,
    'CANCELLED': 'destructive' as const,
  };
  return variants[status] || 'secondary' as const;
};

const getStatusIcon = (status: CustomOrderStatus) => {
  switch (status) {
    case 'QUOTED': return <AlertCircle className="w-4 h-4" />;
    case 'ADVANCE_PENDING': return <Clock className="w-4 h-4" />;
    case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
    case 'READY_FOR_DELIVERY': return <CheckCircle className="w-4 h-4" />;
    case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
    case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const CustomOrderDetailPage = () => {
  const [order] = useState<FullCustomOrderDetails>(mockCustomOrderDetail);
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [newNote, setNewNote] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In real app, this would make an API call
      console.log('Adding note:', newNote);
      setNewNote('');
    }
  };

  const handleStatusUpdate = (newStatus: CustomOrderStatus) => {
    // In real app, this would make an API call
    console.log('Updating status to:', newStatus);
    setStatusDialogOpen(false);
  };

  const handlePaymentRecord = () => {
    if (paymentAmount && paymentMethod) {
      // In real app, this would make an API call
      console.log('Recording payment:', { amount: paymentAmount, method: paymentMethod });
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentDialogOpen(false);
    }
  };

  const handleImageClick = (image: ImageAsset) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              <p className="text-muted-foreground">
                for <a href={`/customers/${order.customer.id}`} className="text-primary hover:underline">{order.customer.name}</a>
              </p>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Clock className="w-4 h-4" />
                  Update Status
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
            </Dialog>
            
            {['READY_FOR_DELIVERY', 'COMPLETED'].includes(order.status) && (
              <Button variant="outline">
                <Download className="w-4 h-4" />
                Generate Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Order Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{order.fullDescription}</p>
                </div>
              </CardContent>
            </Card>

            {/* Design & Progress Gallery */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Image Gallery</CardTitle>
                  <Button size="sm">
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.imageGallery.map((image) => (
                    <Card key={image.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-muted">
                        <img
                          src={image.url}
                          alt={image.caption}
                          className="w-full h-full object-cover"
                          onClick={() => handleImageClick(image)}
                        />
                      </div>
                      <CardFooter className="p-3">
                        <p className="text-sm text-muted-foreground truncate">{image.caption}</p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Internal Communication Log */}
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.internalNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">{note.author}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-3">
                  <Textarea
                    placeholder="Add an internal note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button onClick={handleAddNote} size="sm">
                    <Plus className="w-4 h-4" />
                    Add Note
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Production Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                        entry.status === order.status ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {entry.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {entry.updatedBy} • {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="text-sm font-medium">{formatCurrency(order.financials.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Advance Paid</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(order.financials.advancePaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount Due</span>
                      <span className="text-sm font-medium text-destructive">{formatCurrency(order.financials.amountDue)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Payment History</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Method</TableHead>
                          <TableHead className="text-xs text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.financials.paymentHistory.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs">{formatDate(payment.date)}</TableCell>
                            <TableCell className="text-xs">{payment.method.replace('_', ' ')}</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(payment.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.caption}</DialogTitle>
            <DialogDescription>
              Uploaded {selectedImage && formatDate(selectedImage.uploadedAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="max-h-96 overflow-hidden rounded-lg">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Select the new status for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {(['QUOTED', 'ADVANCE_PENDING', 'IN_PROGRESS', 'READY_FOR_DELIVERY', 'COMPLETED'] as CustomOrderStatus[]).map((status) => (
              <Button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                variant={status === order.status ? 'default' : 'outline'}
                className="justify-start"
              >
                {getStatusIcon(status)}
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setStatusDialogOpen(false)} variant="outline">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the payment details to record a new payment for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPaymentDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handlePaymentRecord} disabled={!paymentAmount || !paymentMethod}>
              <DollarSign className="w-4 h-4" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomOrderDetailPage;