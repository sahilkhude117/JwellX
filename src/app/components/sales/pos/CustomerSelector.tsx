'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  User, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin,
  UserPlus,
  Check,
  ChevronsUpDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock customer interface
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  totalPurchases?: number;
  lastPurchase?: string;
  isVip?: boolean;
  notes?: string;
}

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
  customers: Customer[];
  onCreateCustomer?: (customer: Omit<Customer, 'id'>) => void;
  placeholder?: string;
  allowWalkIn?: boolean;
}

export function CustomerSelector({
  selectedCustomer,
  onCustomerSelect,
  customers,
  onCreateCustomer,
  placeholder = "Select customer...",
  allowWalkIn = true
}: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    customer.phone?.includes(searchValue) ||
    customer.email?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer | null) => {
    onCustomerSelect(customer);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <User className="h-4 w-4" />
        Customer
      </Label>
      
      <div className="flex gap-2">
        {/* Customer Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between h-11"
            >
              {selectedCustomer ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium truncate">
                      {selectedCustomer.name}
                    </div>
                    {selectedCustomer.phone && (
                      <div className="text-xs text-muted-foreground truncate">
                        {selectedCustomer.phone}
                      </div>
                    )}
                  </div>
                  {selectedCustomer.isVip && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      VIP
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search customers..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="text-center py-6">
                    <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No customers found</p>
                    {onCreateCustomer && searchValue && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateDialog(true)}
                        className="mt-2"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create "{searchValue}"
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
                
                <CommandGroup>
                  {/* Walk-in Customer Option */}
                  {allowWalkIn && (
                    <CommandItem
                      value="walk-in"
                      onSelect={() => handleCustomerSelect(null)}
                      className="flex items-center gap-2 p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Walk-in Customer</div>
                        <div className="text-xs text-muted-foreground">
                          No customer details required
                        </div>
                      </div>
                      {!selectedCustomer && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  )}

                  {/* Customer List */}
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.name}
                      onSelect={() => handleCustomerSelect(customer)}
                      className="flex items-center gap-2 p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {customer.name}
                          </span>
                          {customer.isVip && (
                            <Badge variant="secondary" className="h-4 text-xs">
                              VIP
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedCustomer?.id === customer.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear Selection */}
        {selectedCustomer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCustomerSelect(null)}
            className="h-11 w-11 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Add New Customer */}
        {onCreateCustomer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="h-11 w-11 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer && (
        <Card className="mt-2">
          <CardContent className="p-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedCustomer.name}</span>
                {selectedCustomer.isVip && (
                  <Badge variant="secondary">VIP Customer</Badge>
                )}
              </div>
              
              {selectedCustomer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {selectedCustomer.phone}
                </div>
              )}
              
              {selectedCustomer.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {selectedCustomer.email}
                </div>
              )}
              
              {selectedCustomer.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {selectedCustomer.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Customer Dialog */}
      {onCreateCustomer && (
        <CreateCustomerDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateCustomer={onCreateCustomer}
          initialName={searchValue}
        />
      )}
    </div>
  );
}

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCustomer: (customer: Omit<Customer, 'id'>) => void;
  initialName?: string;
}

function CreateCustomerDialog({ 
  open, 
  onOpenChange, 
  onCreateCustomer, 
  initialName = '' 
}: CreateCustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: initialName,
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreateCustomer({
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      notes: ''
    });
    
    onOpenChange(false);
  };

  const handleReset = () => {
    setFormData({
      name: initialName,
      phone: '',
      email: '',
      address: '',
      city: '',
      notes: ''
    });
  };

  React.useEffect(() => {
    if (open) {
      setFormData(prev => ({ ...prev, name: initialName }));
    }
  }, [open, initialName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer name"
                required
                autoFocus
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}