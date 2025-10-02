'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Import POS Components
import { 
  ProductGrid, 
  ProductFilters, 
  CartSummary, 
  PaymentProcessor, 
  PosSessionManager,
  type Product,
  type CartItem,
  type Payment,
  type TransactionSummary,
  type PosSession
} from '@/app/components/sales/pos';

// Import Customer Components
import CustomerSelector from '@/app/components/customers/selectors/customer-selector';
import { CustomerWithStats } from '@/lib/types/customers/customers';
// Import the old Customer type for compatibility with POS components
import { Customer } from '@/app/components/sales/pos/CustomerSelector';

import { 
  Settings, 
  BarChart3,
  Clock,
  ShoppingCart,
  Search,
  Receipt,
  Users,
  Package,
  AlertTriangle,
  Plus
} from 'lucide-react';

// Mock Data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'GR001',
    name: 'Elegant Gold Ring 22K',
    price: 45000,
    weight: 5.2,
    stock: 12,
    category: 'Rings',
    brand: 'Premium Gold',
    image: '',
    isFeatured: true,
    materialBreakdown: [
      {
        materialId: 'm1',
        materialName: '22K Gold',
        weight: 5.2,
        ratePerGram: 6500,
        value: 33800
      }
    ]
  },
  {
    id: '2',
    sku: 'GC002',
    name: 'Gold Chain Traditional',
    price: 82000,
    weight: 12.8,
    stock: 8,
    category: 'Chains',
    brand: 'Classic Gold',
    image: '',
    materialBreakdown: [
      {
        materialId: 'm1',
        materialName: '22K Gold',
        weight: 12.8,
        ratePerGram: 6400,
        value: 81920
      }
    ]
  },
  {
    id: '3',
    sku: 'SE003',
    name: 'Silver Earrings Floral',
    price: 3500,
    weight: 8.5,
    stock: 25,
    category: 'Earrings',
    brand: 'Silver Style',
    image: '',
    materialBreakdown: [
      {
        materialId: 'm2',
        materialName: 'Sterling Silver',
        weight: 8.5,
        ratePerGram: 85,
        value: 722.5
      }
    ]
  },
  {
    id: '4',
    sku: 'DB004',
    name: 'Diamond Bracelet Luxury',
    price: 125000,
    weight: 15.2,
    stock: 3,
    category: 'Bracelets',
    brand: 'Diamond Elite',
    image: '',
    isLowStock: true,
    isFeatured: true,
    materialBreakdown: [
      {
        materialId: 'm1',
        materialName: '18K Gold',
        weight: 12.0,
        ratePerGram: 5200,
        value: 62400
      }
    ]
  },
  {
    id: '5',
    sku: 'GP005',
    name: 'Gold Pendant Heart Shape',
    price: 28000,
    weight: 4.2,
    stock: 15,
    category: 'Pendants',
    brand: 'Premium Gold',
    image: '',
    materialBreakdown: [
      {
        materialId: 'm1',
        materialName: '22K Gold',
        weight: 4.2,
        ratePerGram: 6600,
        value: 27720
      }
    ]
  }
];

// Mock customers are now handled by the CustomerSelector component

const MOCK_CATEGORIES = [
  { id: 'rings', name: 'Rings', count: 45 },
  { id: 'chains', name: 'Chains', count: 32 },
  { id: 'earrings', name: 'Earrings', count: 28 },
  { id: 'bracelets', name: 'Bracelets', count: 18 },
  { id: 'pendants', name: 'Pendants', count: 22 }
];

const MOCK_BRANDS = [
  { id: 'premium-gold', name: 'Premium Gold', count: 35 },
  { id: 'classic-gold', name: 'Classic Gold', count: 28 },
  { id: 'silver-style', name: 'Silver Style', count: 22 },
  { id: 'diamond-elite', name: 'Diamond Elite', count: 15 }
];

export default function PosPage() {
  // State Management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [currentSession, setCurrentSession] = useState<PosSession | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { toast } = useToast();

  // Helper function to convert CustomerWithStats to old Customer type
  const convertCustomerForTransaction = (customer: CustomerWithStats | null): Customer | null => {
    if (!customer) return null;
    
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email || undefined,
      phone: customer.phoneNumber || undefined,
      address: customer.address || undefined,
      totalPurchases: customer.totalPurchases,
      isVip: customer.totalSpent > 100000 // Consider VIP if spent > 1 lakh
    };
  };

  // Initialize with mock session
  useEffect(() => {
    // Mock active session
    setCurrentSession({
      id: 'session-1',
      sessionNumber: 'POS-001-20241002',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'ACTIVE',
      openingCash: 5000,
      totalSales: 45000,
      totalCashSales: 15000,
      totalCardSales: 20000,
      totalUpiSales: 8000,
      totalBankTransferSales: 2000,
      totalTransactions: 8,
      openedBy: 'Current User'
    });
  }, []);

  // Cart Operations
  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }

    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stock Limit Reached",
          description: `Only ${product.stock} units available for ${product.name}.`,
          variant: "destructive"
        });
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: 1,
        weight: product.weight,
        category: product.category,
        materialBreakdown: product.materialBreakdown
      };
      setCartItems(prev => [...prev, newItem]);
      
      toast({
        title: "Added to Cart",
        description: `${product.name} added successfully.`,
      });
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (product && quantity > product.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock} units available.`,
        variant: "destructive"
      });
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Item removed from cart.",
    });
  };

  // Filter Logic
  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    selectedCategory !== 'all' ? 1 : 0,
    selectedBrand !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
  };

  // Checkout Logic
  const handleCheckout = (calculation: any) => {
    if (!currentSession) {
      toast({
        title: "No Active Session",
        description: "Please start a POS session before making sales.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to cart before checkout.",
        variant: "destructive"
      });
      return;
    }

    const transaction: TransactionSummary = {
      subtotal: calculation.subtotal,
      discount: calculation.totalDiscount,
      tax: calculation.taxAmount,
      total: calculation.grandTotal,
      amountPaid: 0,
      balance: calculation.grandTotal,
      payments: [],
      customer: convertCustomerForTransaction(selectedCustomer)
    };

    setIsCheckingOut(true);
    setShowPaymentProcessor(true);
  };

  const handlePaymentComplete = (payments: Payment[]) => {
    // Update session stats
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        totalSales: prev.totalSales + totalAmount,
        totalTransactions: prev.totalTransactions + 1,
        totalCashSales: prev.totalCashSales + payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0),
        totalCardSales: prev.totalCardSales + payments.filter(p => p.method === 'card').reduce((sum, p) => sum + p.amount, 0),
        totalUpiSales: prev.totalUpiSales + payments.filter(p => p.method === 'upi').reduce((sum, p) => sum + p.amount, 0),
        totalBankTransferSales: prev.totalBankTransferSales + payments.filter(p => p.method === 'bank_transfer').reduce((sum, p) => sum + p.amount, 0)
      } : null);
    }

    // Clear cart and reset
    setCartItems([]);
    setSelectedCustomer(null);
    setIsCheckingOut(false);
    setShowPaymentProcessor(false);

    toast({
      title: "Sale Completed",
      description: `Transaction completed successfully!`,
    });
  };

  // Session Management
  const handleStartSession = (openingCash: number) => {
    const newSession: PosSession = {
      id: 'session-' + Date.now(),
      sessionNumber: `POS-001-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      startTime: new Date(),
      status: 'ACTIVE',
      openingCash,
      totalSales: 0,
      totalCashSales: 0,
      totalCardSales: 0,
      totalUpiSales: 0,
      totalBankTransferSales: 0,
      totalTransactions: 0,
      openedBy: 'Current User'
    };
    
    setCurrentSession(newSession);
    toast({
      title: "Session Started",
      description: `POS session ${newSession.sessionNumber} started successfully.`,
    });
  };

  const handleEndSession = (closingCash: number, notes?: string) => {
    if (currentSession) {
      const updatedSession: PosSession = {
        ...currentSession,
        status: 'CLOSED',
        endTime: new Date(),
        closingCash,
        expectedCash: currentSession.openingCash + currentSession.totalCashSales,
        variance: closingCash - (currentSession.openingCash + currentSession.totalCashSales),
        closedBy: 'Current User'
      };
      
      setCurrentSession(updatedSession);
      toast({
        title: "Session Ended",
        description: `POS session closed successfully.`,
      });
    }
  };

  const handleCustomerCreated = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    toast({
      title: "Customer Selected",
      description: `${customer.name} has been selected for this sale.`,
    });
  };

  if (!currentSession) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Point of Sale</h1>
            <p className="text-muted-foreground">Start a session to begin sales</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            No Active Session
          </Badge>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <PosSessionManager
              currentSession={currentSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">
            Session: {currentSession.sessionNumber}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="default" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Session
          </Badge>
          
          <div className="flex items-center gap-2 text-sm">
            <Receipt className="h-4 w-4" />
            <span>{currentSession.totalTransactions} transactions</span>
          </div>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col border-r">
          {/* Product Filters */}
          <div className="p-4 border-b bg-muted/20">
            <ProductFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              categories={MOCK_CATEGORIES}
              brands={MOCK_BRANDS}
              activeFiltersCount={activeFiltersCount}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <ProductGrid
                  products={MOCK_PRODUCTS}
                  onAddToCart={addToCart}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  selectedBrand={selectedBrand}
                  viewMode={viewMode}
                />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Panel - Cart & Session */}
        <div className="w-[400px] flex flex-col">
          {/* Customer Selection */}
          <div className="p-4 border-b">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
            </div>
            <CustomerSelector
              value={selectedCustomer?.id || null}
              onChange={(customerId) => {
                // The actual customer object will be passed via onCustomerSelected
                // This is just to update the selected ID
              }}
              onCustomerSelected={(customer) => {
                setSelectedCustomer(customer);
              }}
              onCustomerCreated={handleCustomerCreated}
              className="w-full"
              width={360}
            />
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-muted/20 rounded-md">
                <p className="text-sm font-medium">{selectedCustomer.name}</p>
                {selectedCustomer.phoneNumber && (
                  <p className="text-xs text-muted-foreground">{selectedCustomer.phoneNumber}</p>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="flex-1 flex flex-col">
            <CartSummary
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
            />
          </div>

          {/* Session Quick Stats */}
          <div className="p-4 border-t bg-muted/20">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Today's Sales</p>
                <p className="font-semibold">₹{currentSession.totalSales.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Transactions</p>
                <p className="font-semibold">{currentSession.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Processor Modal */}
      {showPaymentProcessor && (
        <PaymentProcessor
          isOpen={showPaymentProcessor}
          onClose={() => {
            setShowPaymentProcessor(false);
            setIsCheckingOut(false);
          }}
          transaction={{
            subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            discount: 0,
            tax: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.03,
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.03,
            amountPaid: 0,
            balance: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.03,
            payments: [],
            customer: convertCustomerForTransaction(selectedCustomer)
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
