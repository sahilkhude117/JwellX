
'use client';
// types/orders.ts
export type RepairStatus = 
  | 'ITEM_RECEIVED'
  | 'QUOTE_PENDING'
  | 'IN_REPAIR'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type RepairOrderRowData = {
  id: string;
  jobTicketNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  dateReceived: string;
  promisedDate: string;
  itemDescription: string;
  estimatedCharge: number;
  status: RepairStatus;
  intakeImageUrl?: string;
};

// mock/data.ts
export const mockRepairOrders: RepairOrderRowData[] = [
  {
    id: 'rep_1',
    jobTicketNumber: 'REP-25-001',
    customer: { id: 'cust_2', name: 'Rohan Sharma', phone: '9876543210' },
    dateReceived: '2025-06-18T14:00:00.000Z',
    promisedDate: '2025-06-25T18:00:00.000Z',
    itemDescription: 'Men\'s 22K gold ring, broken shank.',
    estimatedCharge: 1500,
    status: 'IN_REPAIR',
    intakeImageUrl: '/mocks/ring_broken.jpg',
  },
  {
    id: 'rep_2',
    jobTicketNumber: 'REP-25-002',
    customer: { id: 'cust_1', name: 'Priya Mehta', phone: '9876543211' },
    dateReceived: '2025-06-17T11:30:00.000Z',
    promisedDate: '2025-06-20T18:00:00.000Z',
    itemDescription: 'Diamond pendant, re-tipping prongs.',
    estimatedCharge: 3000,
    status: 'READY_FOR_PICKUP',
    intakeImageUrl: '/mocks/pendant_worn.jpg',
  },
  {
    id: 'rep_3',
    jobTicketNumber: 'REP-25-003',
    customer: { id: 'cust_4', name: 'Sunita Patil', phone: '9988776655' },
    dateReceived: '2025-06-19T10:00:00.000Z',
    promisedDate: '2025-06-22T18:00:00.000Z',
    itemDescription: 'Silver anklet, broken clasp.',
    estimatedCharge: 500,
    status: 'ITEM_RECEIVED',
    intakeImageUrl: '/mocks/anklet_clasp.jpg',
  },
  {
    id: 'rep_4',
    jobTicketNumber: 'REP-25-004',
    customer: { id: 'cust_3', name: 'Amit Kumar', phone: '9123456789' },
    dateReceived: '2025-06-16T09:00:00.000Z',
    promisedDate: '2025-06-21T18:00:00.000Z',
    itemDescription: 'Gold chain, broken link.',
    estimatedCharge: 800,
    status: 'QUALITY_CHECK',
    intakeImageUrl: '/mocks/chain_broken.jpg',
  },
  {
    id: 'rep_5',
    jobTicketNumber: 'REP-25-005',
    customer: { id: 'cust_5', name: 'Kavitha Reddy', phone: '9876541234' },
    dateReceived: '2025-06-15T16:00:00.000Z',
    promisedDate: '2025-06-19T18:00:00.000Z',
    itemDescription: 'Silver earrings, polishing required.',
    estimatedCharge: 300,
    status: 'COMPLETED',
    intakeImageUrl: '/mocks/earrings_tarnished.jpg',
  },
];

export const mockCustomers = [
  { id: 'cust_1', name: 'Priya Mehta', phone: '9876543211' },
  { id: 'cust_2', name: 'Rohan Sharma', phone: '9876543210' },
  { id: 'cust_3', name: 'Amit Kumar', phone: '9123456789' },
  { id: 'cust_4', name: 'Sunita Patil', phone: '9988776655' },
  { id: 'cust_5', name: 'Kavitha Reddy', phone: '9876541234' },
];



import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Printer,
  CreditCard,
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Upload,
  X,
} from 'lucide-react';

const statusColors: Record<RepairStatus, string> = {
  ITEM_RECEIVED: 'bg-blue-100 text-blue-800',
  QUOTE_PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REPAIR: 'bg-orange-100 text-orange-800',
  QUALITY_CHECK: 'bg-purple-100 text-purple-800',
  READY_FOR_PICKUP: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<RepairStatus, string> = {
  ITEM_RECEIVED: 'Item Received',
  QUOTE_PENDING: 'Quote Pending',
  IN_REPAIR: 'In Repair',
  QUALITY_CHECK: 'Quality Check',
  READY_FOR_PICKUP: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

interface NewRepairJobFormData {
  customerId: string;
  itemDescription: string;
  customerIssue: string;
  estimatedCharge: string;
  promisedDate: Date;
  images: File[];
}

export default function RepairOrdersPage() {
  const [repairOrders, setRepairOrders] = useState<RepairOrderRowData[]>(mockRepairOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'ALL'>('ALL');
  const [isNewRepairDialogOpen, setIsNewRepairDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<RepairStatus>('ITEM_RECEIVED');
  
  // Form state for new repair job
  const [formData, setFormData] = useState<NewRepairJobFormData>({
    customerId: '',
    itemDescription: '',
    customerIssue: '',
    estimatedCharge: '',
    promisedDate: new Date(),
    images: [],
  });
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return repairOrders.filter(order => {
      const matchesSearch = 
        order.jobTicketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [repairOrders, searchTerm, statusFilter]);

  // KPI calculations
  const kpis = useMemo(() => {
    const activeRepairs = repairOrders.filter(order => 
      ['ITEM_RECEIVED', 'QUOTE_PENDING', 'IN_REPAIR', 'QUALITY_CHECK'].includes(order.status)
    ).length;
    
    const awaitingPickup = repairOrders.filter(order => 
      order.status === 'READY_FOR_PICKUP'
    ).length;
    
    const totalRevenue = repairOrders
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.estimatedCharge, 0);
    
    const overdueRepairs = repairOrders.filter(order => {
      const promisedDate = new Date(order.promisedDate);
      const today = new Date();
      return promisedDate < today && !['COMPLETED', 'CANCELLED'].includes(order.status);
    }).length;

    return { activeRepairs, awaitingPickup, totalRevenue, overdueRepairs };
  }, [repairOrders]);

  const handleNewRepairSubmit = () => {
    const selectedCustomer = mockCustomers.find(c => c.id === formData.customerId);
    if (!selectedCustomer) return;

    const newRepair: RepairOrderRowData = {
      id: `rep_${Date.now()}`,
      jobTicketNumber: `REP-25-${String(repairOrders.length + 1).padStart(3, '0')}`,
      customer: selectedCustomer,
      dateReceived: new Date().toISOString(),
      promisedDate: formData.promisedDate.toISOString(),
      itemDescription: formData.itemDescription,
      estimatedCharge: parseFloat(formData.estimatedCharge),
      status: 'ITEM_RECEIVED',
      intakeImageUrl: formData.images.length > 0 ? URL.createObjectURL(formData.images[0]) : undefined,
    };

    setRepairOrders(prev => [newRepair, ...prev]);
    setIsNewRepairDialogOpen(false);
    
    // Reset form
    setFormData({
      customerId: '',
      itemDescription: '',
      customerIssue: '',
      estimatedCharge: '',
      promisedDate: new Date(),
      images: [],
    });
  };

  const handleStatusUpdate = () => {
    if (!selectedOrderId) return;
    
    setRepairOrders(prev => 
      prev.map(order => 
        order.id === selectedOrderId 
          ? { ...order, status: newStatus }
          : order
      )
    );
    
    setIsUpdateStatusDialogOpen(false);
    setSelectedOrderId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Repair Orders</h1>
          <p className="text-muted-foreground">Manage and track all jewelry repair jobs from intake to completion</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeRepairs}</div>
            <p className="text-xs text-muted-foreground">
              Currently in workshop
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Awaiting Pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.awaitingPickup}</div>
            <p className="text-xs text-muted-foreground">
              Ready for customer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue (Completed)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{kpis.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overdue Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.overdueRepairs}</div>
            <p className="text-xs text-muted-foreground">
              Past promised date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job #, customer, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RepairStatus | 'ALL')}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {Object.entries(statusLabels).map(([status, label]) => (
                <SelectItem key={status} value={status}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isNewRepairDialogOpen} onOpenChange={setIsNewRepairDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Repair Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log New Repair Job</DialogTitle>
              <DialogDescription>
                Create a new repair order and upload intake photos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label>Customer</Label>
                <Popover open={isCustomerSelectOpen} onOpenChange={setIsCustomerSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCustomerSelectOpen}
                      className="w-full justify-between"
                    >
                      {formData.customerId
                        ? mockCustomers.find(customer => customer.id === formData.customerId)?.name
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
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, customerId: customer.id }));
                              setIsCustomerSelectOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.customerId === customer.id ? "opacity-100" : "opacity-0"
                              }`}
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
              </div>

              {/* Item Description */}
              <div className="space-y-2">
                <Label htmlFor="itemDescription">Item Description *</Label>
                <Textarea
                  id="itemDescription"
                  placeholder="Detailed description of the jewelry item..."
                  value={formData.itemDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Customer Issue */}
              <div className="space-y-2">
                <Label htmlFor="customerIssue">Customer Stated Issue</Label>
                <Textarea
                  id="customerIssue"
                  placeholder="What the customer reports is wrong..."
                  value={formData.customerIssue}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerIssue: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Image Intake */}
              <div className="space-y-2">
                <Label>Intake Photos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload "before" photos
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB each
                        </span>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Estimated Charge */}
              <div className="space-y-2">
                <Label htmlFor="estimatedCharge">Estimated Charge (₹)</Label>
                <Input
                  id="estimatedCharge"
                  type="number"
                  placeholder="0"
                  value={formData.estimatedCharge}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedCharge: e.target.value }))}
                />
              </div>

              {/* Promised Date */}
              <div className="space-y-2">
                <Label>Promised By Date</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.promisedDate ? format(formData.promisedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.promisedDate}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({ ...prev, promisedDate: date }));
                          setIsDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewRepairDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleNewRepairSubmit}>
                <Printer className="h-4 w-4 mr-2" />
                Log Repair & Print Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className='pt-0 p-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/orders/repairs/${order.id}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {order.jobTicketNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Received: {format(new Date(order.dateReceived), 'MMM dd')}</div>
                      <div>Promised: {format(new Date(order.promisedDate), 'MMM dd')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={order.intakeImageUrl} alt="Item" />
                        <AvatarFallback>IMG</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm">{order.itemDescription}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{order.estimatedCharge.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/repairs/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setNewStatus(order.status);
                            setIsUpdateStatusDialogOpen(true);
                          }}
                        >
                          <Filter className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print Job Ticket
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.status === 'READY_FOR_PICKUP' && (
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Take Payment & Complete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="font-medium">{order.customer.name}</div>
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="text-sm">
                  <span className="font-medium">{order.jobTicketNumber}</span> - {order.itemDescription}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Promised by: {format(new Date(order.promisedDate), 'MMM dd, yyyy')}</span>
                  <span className="font-medium">₹{order.estimatedCharge.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/orders/repairs/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setNewStatus(order.status);
                        setIsUpdateStatusDialogOpen(true);
                      }}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Update Status
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Job Ticket
                    </DropdownMenuItem>
                    {order.status === 'READY_FOR_PICKUP' && (
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Take Payment & Complete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Repair Status</DialogTitle>
            <DialogDescription>
              Change the status of repair job {selectedOrderId && repairOrders.find(o => o.id === selectedOrderId)?.jobTicketNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as RepairStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <SelectItem key={status} value={status}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {repairOrders.length} repair orders
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}