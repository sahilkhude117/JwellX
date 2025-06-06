'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { on } from "events";
import { Check, ChevronsUpDown, Plus, Search, Trash2, User } from "lucide-react";
import { useCallback, useReducer, useState } from "react";

export type PosCustomer = {
    id: string;
    name: string;
    customerPhone: string;
}

export type ProductVariant = {
    id: string;
    productVariantId: string;
    description: string;
    weight: number;
    unitPrice: number;
    makingCharge: number;
    stock: number;
    sku: string;
}

export type Product = {
  id: string;
  name: string;
  sku: string;
  variants: ProductVariant[];
};

export type CartItem = {
  cartItemId: string;
  productId: string;
  productVariantId: string;
  name: string;
  variantDescription: string;
  sku: string;
  weight: number;
  quantity: number;
  unitPrice: number;
  makingCharge: number;
  lineTotal: number;
};

export type InvoiceState = {
  selectedCustomer: PosCustomer | null;
  items: CartItem[];
  discount: number;
  taxRate: number;
  subTotal: number;
  grandTotal: number;
};

const mockCustomers: PosCustomer[] = [
  { id: 'cust_1', name: 'Rohan Sharma', customerPhone: '9876543210' },
  { id: 'cust_2', name: 'Priya Mehta', customerPhone: '9876543211' },
  { id: 'cust_3', name: 'Arjun Patel', customerPhone: '9876543212' },
  { id: 'cust_4', name: 'Sneha Singh', customerPhone: '9876543213' },
];

const mockProductSearchResults: Product[] = [
  {
    id: 'prod_1',
    name: 'Elegant Gold Ring',
    sku: 'RING-001',
    variants: [
      { id: 'var_1a', productVariantId: 'var_1a', description: '22K, 5.2g, Size 7', weight: 5.2, unitPrice: 35360, makingCharge: 4500, stock: 5, sku: 'RING-001-A' },
      { id: 'var_1b', productVariantId: 'var_1b', description: '18K, 4.8g, Size 7', weight: 4.8, unitPrice: 29280, makingCharge: 4200, stock: 3, sku: 'RING-001-B' },
    ]
  },
  {
    id: 'prod_2',
    name: 'Diamond Necklace',
    sku: 'NECK-001',
    variants: [
      { id: 'var_2a', productVariantId: 'var_2a', description: '18K, 12.5g, 0.5ct', weight: 12.5, unitPrice: 75600, makingCharge: 8500, stock: 2, sku: 'NECK-001-A' },
    ]
  },
  {
    id: 'prod_3',
    name: 'Silver Bracelet',
    sku: 'BRAC-001',
    variants: [
      { id: 'var_3a', productVariantId: 'var_3a', description: '925 Silver, 25g', weight: 25, unitPrice: 2500, makingCharge: 800, stock: 8, sku: 'BRAC-001-A' },
      { id: 'var_3b', productVariantId: 'var_3b', description: '925 Silver, 30g', weight: 30, unitPrice: 3000, makingCharge: 1000, stock: 5, sku: 'BRAC-001-B' },
    ]
  },
];

type InvoiceAction =
  | { type: 'SET_CUSTOMER'; payload: PosCustomer }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'SET_DISCOUNT'; payload: number }
  | { type: 'CLEAR_INVOICE' };

const calculateTotals = (items: CartItem[], discount: number, taxRate: number) => {
  const subTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = (subTotal - discount) * taxRate;
  const grandTotal = subTotal - discount + taxAmount;
  return { subTotal, grandTotal };
};

const invoiceReducer = (state: InvoiceState, action: InvoiceAction): InvoiceState => {
  switch (action.type) {
    case 'SET_CUSTOMER':
      return { ...state, selectedCustomer: action.payload };
    
    case 'ADD_ITEM':
      const newItems = [...state.items, action.payload];
      const totalsAfterAdd = calculateTotals(newItems, state.discount, state.taxRate);
      return { ...state, items: newItems, ...totalsAfterAdd };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.cartItemId !== action.payload);
      const totalsAfterRemove = calculateTotals(filteredItems, state.discount, state.taxRate);
      return { ...state, items: filteredItems, ...totalsAfterRemove };
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item => 
        item.cartItemId === action.payload.cartItemId 
          ? { ...item, quantity: action.payload.quantity, lineTotal: (item.unitPrice + item.makingCharge) * action.payload.quantity }
          : item
      );
      const totalsAfterUpdate = calculateTotals(updatedItems, state.discount, state.taxRate);
      return { ...state, items: updatedItems, ...totalsAfterUpdate };
    
    case 'SET_DISCOUNT':
      const totalsAfterDiscount = calculateTotals(state.items, action.payload, state.taxRate);
      return { ...state, discount: action.payload, ...totalsAfterDiscount };
    
    case 'CLEAR_INVOICE':
      return {
        selectedCustomer: null,
        items: [],
        discount: 0,
        taxRate: 0.03,
        subTotal: 0,
        grandTotal: 0,
      };
    
    default:
      return state;
  }
};

const CustomerSelection = ({ selectedCustomer, onSelectCustomer }: {
    selectedCustomer: PosCustomer | null;
    onSelectCustomer: (customer: PosCustomer) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [newCustomerOpen, setNewCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    const handleAddNewCustomer = () => {
        if (newCustomerName && newCustomerPhone) {
        const newCustomer: PosCustomer = {
            id: `cust_${Date.now()}`,
            name: newCustomerName,
            customerPhone: newCustomerPhone,
        };
        onSelectCustomer(newCustomer);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerOpen(false);
        setOpen(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {selectedCustomer ? (
                                <div className="flex flex-col items-start">
                                <span className="font-medium">{selectedCustomer.name}</span>
                                <span className="text-sm text-muted-foreground">{selectedCustomer.customerPhone}</span>
                                </div>
                            ) : (
                                "Select a customer..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search customers..." />
                                <CommandList>
                                    <CommandEmpty>No customer found.</CommandEmpty>
                                </CommandList>
                                <CommandGroup>
                                    {mockCustomers.map((customer) => (
                                        <CommandItem
                                            key={customer.id}
                                            onSelect={() => {
                                                onSelectCustomer(customer);
                                                setOpen(false);
                                            }}
                                        >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{customer.name}</span>
                                            <span className="text-sm text-muted-foreground">{customer.customerPhone}</span>
                                        </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <div className="p-2 border-t">
                                    <Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-start">
                                                <Plus className="mr-2 h-4 w-4" />
                                                    Add New Customer
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Customer</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="customerName">Name</Label>
                                                    <Input
                                                        id="customerName"
                                                        value={newCustomerName}
                                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                                        placeholder="Enter customer name"
                                                    />
                                                    </div>
                                                    <div>
                                                    <Label htmlFor="customerPhone">Phone</Label>
                                                    <Input
                                                        id="customerPhone"
                                                        value={newCustomerPhone}
                                                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                                                        placeholder="Enter phone number"
                                                    />
                                                </div>
                                                <Button onClick={handleAddNewCustomer} className="w-full">
                                                    Add Customer
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </Command>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    )
}

const ProductSearch = ({ onAddItem }: {
  onAddItem: (item: CartItem) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

  const handleProductSelect = (product: Product) => {
    if (product.variants.length === 1) {
      // Direct add to cart
      addVariantToCart(product, product.variants[0]);
    } else {
      // Show variant selection dialog
      setSelectedProduct(product);
      setVariantDialogOpen(true);
    }
    setOpen(false);
  };

  const addVariantToCart = (product: Product, variant: ProductVariant) => {
    const cartItem: CartItem = {
      cartItemId: `cart_${Date.now()}_${Math.random()}`,
      productId: product.id,
      productVariantId: variant.productVariantId,
      name: product.name,
      variantDescription: variant.description,
      sku: variant.sku,
      weight: variant.weight,
      quantity: 1,
      unitPrice: variant.unitPrice,
      makingCharge: variant.makingCharge,
      lineTotal: variant.unitPrice + variant.makingCharge,
    };
    onAddItem(cartItem);
    setVariantDialogOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Add Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Search products...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search products..." />
                <CommandList>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {mockProductSearchResults.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleProductSelect(product)}
                      >
                        <div className="flex flex-col w-full">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                          <span className="text-xs text-muted-foreground">
                            {product.variants.length} variant{product.variants.length > 1 ? 's' : ''} available
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Variant Selection Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Variant for {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedProduct?.variants.map((variant) => (
              <div
                key={variant.id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-accent"
                onClick={() => addVariantToCart(selectedProduct, variant)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{variant.description}</p>
                    <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                    <p className="text-sm text-muted-foreground">Weight: {variant.weight}g</p>
                    <p className="text-sm text-muted-foreground">Stock: {variant.stock} units</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(variant.unitPrice + variant.makingCharge).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Base: ₹{variant.unitPrice.toLocaleString()} + Making: ₹{variant.makingCharge.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CartTable = ({ items, onUpdateQuantity, onRemoveItem }: {
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart Items ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No items in cart. Search and add products above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.cartItemId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">{item.variantDescription}</span>
                        <span className="text-xs text-muted-foreground">SKU: {item.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.cartItemId, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>₹{(item.unitPrice + item.makingCharge).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">
                          Base: ₹{item.unitPrice.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{item.lineTotal.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.cartItemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BillingSummary = ({ invoiceState, onDiscountChange }: {
  invoiceState: InvoiceState;
  onDiscountChange: (discount: number) => void;
}) => {
  const taxAmount = (invoiceState.subTotal - invoiceState.discount) * invoiceState.taxRate;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Billing Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{invoiceState.subTotal.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Discount</span>
          <Input
            type="number"
            value={invoiceState.discount}
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
            className="w-24 text-right"
            placeholder="0"
          />
        </div>
        
        <div className="flex justify-between">
          <span>GST @ {(invoiceState.taxRate * 100).toFixed(0)}%</span>
          <span>₹{taxAmount.toLocaleString()}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Grand Total</span>
            <span>₹{invoiceState.grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const PaymentDialog = ({ open, onOpenChange, grandTotal, onCompletePayment }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grandTotal: number;
  onCompletePayment: () => void;
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');

  const handleCompletePayment = () => {
    // In a real app, this would submit to the API
    onCompletePayment();
    onOpenChange(false);
    setPaymentMethod('cash');
    setTransactionId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amount Due</p>
            <p className="text-3xl font-bold">₹{grandTotal.toLocaleString()}</p>
          </div>
          
          <div>
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Credit Card</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI</Label>
              </div>
            </RadioGroup>
          </div>
          
          {paymentMethod !== 'cash' && (
            <div>
              <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>
          )}
          
          <Button onClick={handleCompletePayment} className="w-full">
            Generate Invoice & Complete Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function PosPage() {
    const [invoiceState, dispatch] = useReducer(invoiceReducer, {
        selectedCustomer: null,
        items: [],
        discount: 0,
        taxRate: 0.03, // 3% GST
        subTotal: 0,
        grandTotal: 0,
    })

    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    const handleSelectCustomer = useCallback((customer: PosCustomer) => {
        dispatch({ type: 'SET_CUSTOMER', payload: customer });
    }, []);

    const handleAddItem = useCallback((item: CartItem) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    }, []);

    const handleUpdateQuantity = useCallback((cartItemId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
    }, []);

    const handleRemoveItem = useCallback((cartItemId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
    }, []);

    const handleDiscountChange = useCallback((discount: number) => {
        dispatch({ type: 'SET_DISCOUNT', payload: discount });
    }, []);

    const handleHoldSale = useCallback(() => {
        dispatch({ type: 'CLEAR_INVOICE' });
    }, []);

    const handleCompletePayment = useCallback(() => {
        // In a real app, this would submit to the API
        alert('Payment completed successfully!');
        dispatch({ type: 'CLEAR_INVOICE' });
    }, []);


    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Point of Sale</h1>
                <p className="text-muted-foreground">Create a new sale and generate invoice</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Selection */}
                    <CustomerSelection 
                        selectedCustomer={invoiceState.selectedCustomer}
                        onSelectCustomer={handleSelectCustomer}
                    />

                    {/* Product Search */}
                    <ProductSearch onAddItem={handleAddItem} />

                    {/* Cart Items */}
                    <CartTable 
                        items={invoiceState.items}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                    />
                </div>

                <div className="space-y-6">
                    <div className="lg:hidden">
                        <BillingSummary 
                            invoiceState={invoiceState}
                            onDiscountChange={handleDiscountChange}
                        />
                    </div>

                    {/* Desktop: Normal order */}
                    <div className="hidden lg:block">
                        <BillingSummary 
                            invoiceState={invoiceState}
                            onDiscountChange={handleDiscountChange}
                        />
                    </div>

                    <Card>
                        <CardContent className="pt-6 space-y-3">
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleHoldSale}
                        >
                            Hold Sale
                        </Button>
                        <Button 
                            className="w-full"
                            onClick={() => setPaymentDialogOpen(true)}
                            disabled={invoiceState.items.length === 0 || !invoiceState.selectedCustomer}
                        >
                            Proceed to Payment
                        </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                grandTotal={invoiceState.grandTotal}
                onCompletePayment={handleCompletePayment}
            />
        </div>
    )

}