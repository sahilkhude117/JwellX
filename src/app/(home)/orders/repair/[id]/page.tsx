'use client';
// types/orders.ts
export type RepairStatus = 
  | 'ITEM_RECEIVED'
  | 'IN_REPAIR'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'ON_HOLD';

export type StatusHistoryEntry = {
  status: RepairStatus;
  date: string; // ISO Date String
  updatedBy: string;
};

export type ImageAsset = {
  id: string;
  url: string;
  type: 'BEFORE' | 'AFTER';
  uploadedAt: string;
};

export type WorkLogEntry = {
  id: string;
  log: string;
  author: string;
  createdAt: string;
};

// The comprehensive payload from GET /api/orders/repairs/[id]
export type FullRepairOrderDetails = {
  id: string;
  jobTicketNumber: string;
  customer: { id: string; name: string; };
  status: RepairStatus;
  dateReceived: string;
  promisedDate: string;
  itemDescription: string;
  customerStatedIssue: string;
  
  financials: {
    estimatedCharge: number;
    amountPaid: number;
    amountDue: number;
  };

  statusHistory: StatusHistoryEntry[];
  imageGallery: ImageAsset[];
  workLog: WorkLogEntry[];
};

// mock/data.ts
export const mockRepairDetail: FullRepairOrderDetails = {
  id: 'rep_2',
  jobTicketNumber: 'REP-25-002',
  customer: { id: 'cust_1', name: 'Priya Mehta' },
  status: 'READY_FOR_PICKUP',
  dateReceived: '2025-06-17T11:30:00.000Z',
  promisedDate: '2025-06-20T18:00:00.000Z',
  itemDescription: 'Ladies diamond pendant, 18K gold.',
  customerStatedIssue: 'One of the small diamonds feels loose, worried it might fall out. Please check all prongs.',
  financials: {
    estimatedCharge: 3000,
    amountPaid: 0,
    amountDue: 3000,
  },
  statusHistory: [
    { status: 'ITEM_RECEIVED', date: '2025-06-17T11:30:00.000Z', updatedBy: 'Amit Kumar' },
    { status: 'IN_REPAIR', date: '2025-06-18T10:00:00.000Z', updatedBy: 'Artisan_John' },
    { status: 'QUALITY_CHECK', date: '2025-06-18T16:00:00.000Z', updatedBy: 'Priya Mehta' },
    { status: 'READY_FOR_PICKUP', date: '2025-06-18T16:30:00.000Z', updatedBy: 'Priya Mehta' },
  ],
  imageGallery: [
    { id: 'img1', url: '/mocks/pendant_worn.jpg', type: 'BEFORE', uploadedAt: '2025-06-17T11:31:00.000Z' },
    { id: 'img2', url: '/mocks/pendant_repaired.jpg', type: 'AFTER', uploadedAt: '2025-06-18T15:55:00.000Z' },
  ],
  workLog: [
    { id: 'log1', log: 'Identified two loose prongs on the main setting. Re-tipped and secured.', author: 'Artisan_John', createdAt: '2025-06-18T14:00:00.000Z' },
    { id: 'log2', log: 'Full piece cleaned in ultrasonic cleaner and polished.', author: 'Artisan_John', createdAt: '2025-06-18T15:45:00.000Z' },
  ],
};

// app/dashboard/orders/repairs/[id]/page.tsx


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  Clock,
  User,
  Upload,
  FileText,
  CreditCard,
  Printer,
  CheckCircle,
  AlertCircle,
  Package,
  Wrench
} from 'lucide-react';

// Status badge styling
const getStatusBadgeVariant = (status: RepairStatus) => {
  switch (status) {
    case 'ITEM_RECEIVED':
      return 'secondary';
    case 'IN_REPAIR':
      return 'default';
    case 'QUALITY_CHECK':
      return 'outline';
    case 'READY_FOR_PICKUP':
      return 'default';
    case 'COMPLETED':
      return 'default';
    case 'ON_HOLD':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: RepairStatus) => {
  switch (status) {
    case 'ITEM_RECEIVED':
      return <Package className="w-4 h-4" />;
    case 'IN_REPAIR':
      return <Wrench className="w-4 h-4" />;
    case 'QUALITY_CHECK':
      return <AlertCircle className="w-4 h-4" />;
    case 'READY_FOR_PICKUP':
      return <CheckCircle className="w-4 h-4" />;
    case 'COMPLETED':
      return <CheckCircle className="w-4 h-4" />;
    case 'ON_HOLD':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatStatusLabel = (status: RepairStatus) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

interface RepairOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RepairOrderDetailPage({ params }: RepairOrderDetailPageProps) {
  const unwrappedParams = React.use(params);
  const [repairData, setRepairData] = useState<FullRepairOrderDetails | null>(null);
  const [newWorkLog, setNewWorkLog] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus>('ITEM_RECEIVED');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Mock data loading
  useEffect(() => {
    // In real implementation, fetch data based on unwrappedParams.id
    setRepairData(mockRepairDetail);
    setSelectedStatus(mockRepairDetail.status);
  }, [unwrappedParams.id]);

  const handleAddWorkLog = () => {
    if (!repairData || !newWorkLog.trim()) return;

    const newEntry: WorkLogEntry = {
      id: `log_${Date.now()}`,
      log: newWorkLog,
      author: 'Current User', // In real app, get from auth context
      createdAt: new Date().toISOString(),
    };

    setRepairData({
      ...repairData,
      workLog: [...repairData.workLog, newEntry],
    });
    setNewWorkLog('');
  };

  const handleStatusUpdate = () => {
    if (!repairData) return;

    const newHistoryEntry = {
      status: selectedStatus,
      date: new Date().toISOString(),
      updatedBy: 'Current User',
    };

    setRepairData({
      ...repairData,
      status: selectedStatus,
      statusHistory: [...repairData.statusHistory, newHistoryEntry],
    });
  };

  const handlePayment = () => {
    if (!repairData || !paymentAmount) return;

    const payment = parseFloat(paymentAmount);
    const newAmountPaid = repairData.financials.amountPaid + payment;
    const newAmountDue = repairData.financials.estimatedCharge - newAmountPaid;

    setRepairData({
      ...repairData,
      financials: {
        ...repairData.financials,
        amountPaid: newAmountPaid,
        amountDue: Math.max(0, newAmountDue),
      },
    });
    setPaymentAmount('');
  };

  if (!repairData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {repairData.jobTicketNumber}
          </h1>
          <Link 
            href={`/dashboard/customers/${repairData.customer.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            for {repairData.customer.name}
          </Link>
          <Badge variant={getStatusBadgeVariant(repairData.status)} className="w-fit">
            <span className="flex items-center gap-1">
              {getStatusIcon(repairData.status)}
              {formatStatusLabel(repairData.status)}
            </span>
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Update Status Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Repair Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">New Status</Label>
                  <Select value={selectedStatus} onValueChange={(value: RepairStatus) => setSelectedStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ITEM_RECEIVED">Item Received</SelectItem>
                      <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                      <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                      <SelectItem value="READY_FOR_PICKUP">Ready for Pickup</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleStatusUpdate} className="w-full">
                  Update Status
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Take Payment Dialog */}
          {repairData.financials.amountDue > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Take Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment">Payment Amount</Label>
                    <Input
                      id="payment"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Amount Due: {formatCurrency(repairData.financials.amountDue)}
                  </div>
                  <Button onClick={handlePayment} className="w-full">
                    Record Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Print Job Ticket */}
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1" />
            Print Ticket
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item & Issue Card */}
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Item Description</h4>
                <p className="text-gray-900">{repairData.itemDescription}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Customer Reported Issue</h4>
                <p className="text-gray-900">{repairData.customerStatedIssue}</p>
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery Card */}
          <Card>
            <CardHeader>
              <CardTitle>Visual Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="before" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="before">Before (Intake)</TabsTrigger>
                  <TabsTrigger value="after">After (Completion)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="before" className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {repairData.imageGallery
                      .filter(img => img.type === 'BEFORE')
                      .map(image => (
                        <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={image.url.startsWith('/') ? image.url : `/` + image.url} 
                            alt="Before repair" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    <Button variant="outline" className="aspect-square flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-xs">Upload Before</span>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="after" className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {repairData.imageGallery
                        .filter(img => img.type === 'AFTER')
                        .map(image => (
                            <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {/* Use next/image for better handling and avoid fallback to placeholder */}
                                <img 
                                    src={image.url} 
                                    alt="After repair" 
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                        // Hide broken images instead of triggering placeholder fetches
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    <Button variant="outline" className="aspect-square flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-xs">Upload After</span>
                    </Button>
                  </div>
                </TabsContent>
                
              </Tabs>
            </CardContent>
          </Card>

          {/* Work Log Card */}
          <Card>
            <CardHeader>
              <CardTitle>Artisan's Work Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {repairData.workLog.map(entry => (
                <div key={entry.id} className="border-l-2 border-blue-200 pl-4 py-2">
                  <p className="text-gray-900 mb-1">{entry.log}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{entry.author}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(entry.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Textarea
                placeholder="Add work log entry..."
                value={newWorkLog}
                onChange={(e) => setNewWorkLog(e.target.value)}
                className="min-h-[80px]"
              />
              <Button onClick={handleAddWorkLog} className="w-full" disabled={!newWorkLog.trim()}>
                Add Log Entry
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Repair Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Repair Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairData.statusHistory.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.status === repairData.status 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {getStatusIcon(entry.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        entry.status === repairData.status ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {formatStatusLabel(entry.status)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <span>{entry.updatedBy}</span>
                        <span>•</span>
                        <span>{format(new Date(entry.date), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Repair Charge:</span>
                <strong>{formatCurrency(repairData.financials.estimatedCharge)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <strong>{formatCurrency(repairData.financials.amountPaid)}</strong>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Due:</span>
                <strong className="text-lg text-red-600">
                  {formatCurrency(repairData.financials.amountDue)}
                </strong>
              </div>
            </CardContent>
          </Card>

          {/* Key Dates Card */}
          <Card>
            <CardHeader>
              <CardTitle>Key Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date Received</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(repairData.dateReceived), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Promised Date</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(repairData.promisedDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}