'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Save, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  User, 
  Users, 
  Check, 
  ChevronsUpDown,
  X
} from 'lucide-react';

// TypeScript Interfaces
interface MaterialSnapshot {
  materialId: string;
  name?: string;
  purity?: string;
  weight: number;
  rate: number;
  totalCost: number;
}

interface GemstoneSnapshot {
  gemstoneId: string;
  name?: string;
  caratWeight: number;
  cut?: string;
  color?: string;
  clarity?: string;
  rate: number;
  totalCost: number;
}

interface VariantUI {
  id: string;
  name: string;
  sku: string;
  totalWeight: number;
  quantity: number;
  makingChargeType?: 'PERCENTAGE' | 'PER_GRAM' | 'FIXED';
  makingChargeValue?: number;
  wastage?: number;
  materials: MaterialSnapshot[];
  gemstones: GemstoneSnapshot[];
}

interface InventoryCreatePayload {
  batch?: {
    supplier?: string;
    invoiceNo?: string;
    purchaseDate?: string;
  };
  inventoryItem: {
    variantId?: string | null;
    name: string;
    itemCode?: string;
    huid?: string;
    category: string;
    weight: number;
    purity?: string;
    location?: string;
    quantity: number;
    makingChargeType?: 'PERCENTAGE'|'PER_GRAM'|'FIXED';
    makingChargeValue?: number;
    wastage?: number;
    materials: MaterialSnapshot[];
    gemstones: GemstoneSnapshot[];
  }
}

// Mock Data
const mockCategories = [
  { id: 'NECKLACE', name: 'Necklace' },
  { id: 'EARRINGS', name: 'Earrings' },
  { id: 'RING', name: 'Ring' },
  { id: 'BRACELET', name: 'Bracelet' },
  { id: 'PENDANT', name: 'Pendant' }
];

const mockBrands = [
  { id: 'brand-1', name: 'Tanishq' },
  { id: 'brand-2', name: 'Kalyan Jewellers' },
  { id: 'brand-3', name: 'PC Jeweller' }
];

const mockMaterials = [
  { id: 'mat-gold-22k', name: 'Gold 22K', purity: '22K', defaultRate: 3750 },
  { id: 'mat-gold-18k', name: 'Gold 18K', purity: '18K', defaultRate: 3200 },
  { id: 'mat-silver', name: 'Silver', purity: '925', defaultRate: 65 }
];

const mockGemstones = [
  { id: 'gem-diamond', name: 'Diamond', shape: 'ROUND', defaultRate: 2000 },
  { id: 'gem-ruby', name: 'Ruby', shape: 'OVAL', defaultRate: 1500 },
  { id: 'gem-emerald', name: 'Emerald', shape: 'EMERALD', defaultRate: 1800 }
];

const mockOccasions = [
  { id: 'WEDDING', name: 'Wedding' },
  { id: 'FESTIVAL', name: 'Festival' },
  { id: 'DAILY', name: 'Daily Wear' },
  { id: 'PARTY', name: 'Party' }
];

const mockStyles = [
  { id: 'TRADITIONAL', name: 'Traditional' },
  { id: 'CONTEMPORARY', name: 'Contemporary' },
  { id: 'ANTIQUE', name: 'Antique' },
  { id: 'MODERN', name: 'Modern' }
];

// Localization strings
const labels = {
  pageTitle: 'Add Inventory',
  productDetails: 'Product Details',
  productName: 'Product Name',
  productSku: 'SKU',
  generateSku: 'Generate',
  description: 'Description',
  category: 'Category',
  brand: 'Brand',
  occasion: 'Occasion',
  gender: 'Gender',
  style: 'Style',
  variants: 'Variants',
  addVariant: 'Add Variant',
  materials: 'Materials',
  gemstones: 'Gemstones',
  inventoryPricing: 'Inventory & Pricing',
  makingCharge: 'Making Charge',
  wastage: 'Wastage %',
  location: 'Location',
  quantity: 'Quantity',
  purchasePrice: 'Purchase Price',
  saveDraft: 'Save Draft',
  saveAddAnother: 'Save & Add Another',
  save: 'Save',
  edit: 'Edit',
  duplicate: 'Duplicate',
  delete: 'Delete',
  create: 'Create',
  cancel: 'Cancel'
};

// Mock API functions
const saveInventory = async (payload: InventoryCreatePayload): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Saving inventory:', payload);
      resolve();
    }, 1000);
  });
};

const generateSKU = (): string => {
  return `SKU${Math.floor(Math.random() * 100000)}`;
};

// Main Component
export default function AddInventoryPage() {
  // State
  const [productName, setProductName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [occasion, setOccasion] = useState('');
  const [gender, setGender] = useState('');
  const [style, setStyle] = useState('');
  const [variants, setVariants] = useState<VariantUI[]>([]);
  const [makingChargeType, setMakingChargeType] = useState<'PERCENTAGE' | 'PER_GRAM' | 'FIXED'>('PERCENTAGE');
  const [makingChargeValue, setMakingChargeValue] = useState(5);
  const [wastage, setWastage] = useState(5);
  const [location, setLocation] = useState('Shop');
  const [quantity, setQuantity] = useState(1);
  const [purchasePriceOverride, setPurchasePriceOverride] = useState(false);
  const [manualPurchasePrice, setManualPurchasePrice] = useState(0);

  // Dialog/Popover states
  const [editingVariant, setEditingVariant] = useState<VariantUI | null>(null);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [isMaterialsExpanded, setIsMaterialsExpanded] = useState(true);
  const [isGemstonesExpanded, setIsGemstonesExpanded] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Add default variant on mount
  useEffect(() => {
    if (variants.length === 0) {
      const defaultVariant: VariantUI = {
        id: 'variant-1',
        name: 'Default',
        sku: generateSKU(),
        totalWeight: 12,
        quantity: 1,
        materials: [{
          materialId: 'mat-gold-22k',
          name: 'Gold 22K',
          purity: '22K',
          weight: 12,
          rate: 3750,
          totalCost: 45000
        }],
        gemstones: []
      };
      setVariants([defaultVariant]);
    }
  }, []);

  // Cost calculations
  const calculateCosts = () => {
    const materialCost = variants.reduce((total, variant) => 
      total + variant.materials.reduce((sum, mat) => sum + mat.totalCost, 0), 0);
    
    const gemCost = variants.reduce((total, variant) => 
      total + variant.gemstones.reduce((sum, gem) => sum + gem.totalCost, 0), 0);
    
    let making = 0;
    if (makingChargeType === 'PERCENTAGE') {
      making = materialCost * (makingChargeValue / 100);
    } else if (makingChargeType === 'PER_GRAM') {
      const totalWeight = variants.reduce((sum, v) => sum + v.totalWeight, 0);
      making = totalWeight * makingChargeValue;
    } else {
      making = makingChargeValue;
    }
    
    const wastageCost = materialCost * (wastage / 100);
    const finalCost = materialCost + gemCost + making + wastageCost;
    
    return { materialCost, gemCost, making, wastageCost, finalCost };
  };

  const costs = calculateCosts();

  // Handlers
  const handleAddVariant = () => {
    const newVariant: VariantUI = {
      id: `variant-${Date.now()}`,
      name: `Variant ${variants.length + 1}`,
      sku: generateSKU(),
      totalWeight: 0,
      quantity: 1,
      materials: [],
      gemstones: []
    };
    setVariants([...variants, newVariant]);
  };

  const handleEditVariant = (variant: VariantUI) => {
    setEditingVariant({ ...variant });
    setIsVariantDialogOpen(true);
  };

  const handleSaveVariant = () => {
    if (!editingVariant) return;
    
    const updatedVariants = variants.map(v => 
      v.id === editingVariant.id ? editingVariant : v
    );
    setVariants(updatedVariants);
    setIsVariantDialogOpen(false);
    setEditingVariant(null);
  };

  const handleDeleteVariant = (variantId: string) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };

  const handleDuplicateVariant = (variant: VariantUI) => {
    const duplicated: VariantUI = {
      ...variant,
      id: `variant-${Date.now()}`,
      name: `${variant.name} (Copy)`,
      sku: generateSKU()
    };
    setVariants([...variants, duplicated]);
  };

  const handleSave = async (saveType: 'draft' | 'save' | 'saveAndAdd') => {
    if (!productName || !category) {
      toast({
        title: "Validation Error",
        description: "Product name and category are required.",
        variant: "destructive"
      });
      return;
    }

    const payload: InventoryCreatePayload = {
      batch: {
        supplier: "Mock Supplier",
        invoiceNo: `INV-${Date.now()}`,
        purchaseDate: new Date().toISOString()
      },
      inventoryItem: {
        variantId: variants[0]?.id || null,
        name: productName,
        itemCode: productSku,
        category,
        weight: variants.reduce((sum, v) => sum + v.totalWeight, 0),
        location,
        quantity,
        makingChargeType,
        makingChargeValue,
        wastage,
        materials: variants.flatMap(v => v.materials),
        gemstones: variants.flatMap(v => v.gemstones)
      }
    };

    try {
      await saveInventory(payload);
      toast({
        title: "Success",
        description: `Inventory ${saveType === 'draft' ? 'draft saved' : 'saved'} successfully!`,
      });

      if (saveType === 'saveAndAdd') {
        // Reset form for new entry
        setProductName('');
        setProductSku('');
        setDescription('');
        setVariants([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save inventory. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      // In real app, this would call API
      setCategory(newCategoryName.toUpperCase().replace(' ', '_'));
      setNewCategoryName('');
      setIsCreatingCategory(false);
      toast({
        title: "Success",
        description: `Category "${newCategoryName}" created successfully!`,
      });
    }
  };

  const handleCreateBrand = () => {
    if (newBrandName.trim()) {
      // In real app, this would call API
      setBrand(`brand-${Date.now()}`);
      setNewBrandName('');
      setIsCreatingBrand(false);
      toast({
        title: "Success",
        description: `Brand "${newBrandName}" created successfully!`,
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{labels.pageTitle}</h1>
              <p className="text-sm text-gray-600">Create new jewelry inventory items</p>
            </div>
            <div className="flex gap-2">
              <Popover open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <h4 className="font-medium">Create New Category</h4>
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateCategory}>
                        Create
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsCreatingCategory(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={isCreatingBrand} onOpenChange={setIsCreatingBrand}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Brand
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <h4 className="font-medium">Create New Brand</h4>
                    <Input
                      placeholder="Brand name"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateBrand}>
                        Create
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsCreatingBrand(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Product & Variants */}
          <div className="lg:col-span-3 space-y-6">
            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>{labels.productDetails}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productName">{labels.productName} *</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Enter product name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productSku">{labels.productSku}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="productSku"
                        value={productSku}
                        onChange={(e) => setProductSku(e.target.value)}
                        placeholder="Auto-generated"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setProductSku(generateSKU())}
                      >
                        {labels.generateSku}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{labels.description}</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product description"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{labels.category} *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{labels.brand}</Label>
                    <Select value={brand} onValueChange={setBrand}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockBrands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{labels.occasion}</Label>
                    <Select value={occasion} onValueChange={setOccasion}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockOccasions.map((occ) => (
                          <SelectItem key={occ.id} value={occ.id}>
                            {occ.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{labels.gender}</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={gender === 'MALE' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGender('MALE')}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Male
                      </Button>
                      <Button
                        variant={gender === 'FEMALE' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGender('FEMALE')}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Female
                      </Button>
                      <Button
                        variant={gender === 'UNISEX' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGender('UNISEX')}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Unisex
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>{labels.style}</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{labels.variants}</CardTitle>
                  <Button onClick={handleAddVariant} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {labels.addVariant}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Weight (g)</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>{variant.name}</TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell>{variant.totalWeight}</TableCell>
                        <TableCell>{variant.quantity}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVariant(variant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateVariant(variant)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVariant(variant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Materials & Pricing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Materials & Gemstones Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Materials & Gemstones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Collapsible open={isMaterialsExpanded} onOpenChange={setIsMaterialsExpanded}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <span className="font-medium">{labels.materials}</span>
                    {isMaterialsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {variants.flatMap(v => v.materials).map((material, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{material.name} ({material.purity})</span>
                        <span>{material.weight}g × ₹{material.rate} = ₹{material.totalCost.toLocaleString()}</span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible open={isGemstonesExpanded} onOpenChange={setIsGemstonesExpanded}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <span className="font-medium">{labels.gemstones}</span>
                    {isGemstonesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {variants.flatMap(v => v.gemstones).map((gem, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{gem.name}</span>
                        <span>{gem.caratWeight}ct × ₹{gem.rate} = ₹{gem.totalCost.toLocaleString()}</span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Inventory & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {labels.inventoryPricing}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Final Cost = Material Cost + Gem Cost + Making + Wastage</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{labels.makingCharge}</Label>
                    <Select value={makingChargeType} onValueChange={(value: any) => setMakingChargeType(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="PER_GRAM">Per Gram</SelectItem>
                        <SelectItem value="FIXED">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={makingChargeValue}
                      onChange={(e) => setMakingChargeValue(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{labels.wastage}</Label>
                    <Input
                      type="number"
                      value={wastage}
                      onChange={(e) => setWastage(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{labels.quantity}</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>{labels.location}</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shop">Shop</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Display">Display Counter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>{labels.purchasePrice}</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="override-price" className="text-xs">Manual Override</Label>
                      <Switch
                        id="override-price"
                        checked={purchasePriceOverride}
                        onCheckedChange={setPurchasePriceOverride}
                      />
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={purchasePriceOverride ? manualPurchasePrice : costs.finalCost}
                    onChange={(e) => setManualPurchasePrice(Number(e.target.value))}
                    disabled={!purchasePriceOverride}
                    className="mt-1"
                  />
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-medium">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Material Cost:</span>
                      <span>₹{costs.materialCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gemstone Cost:</span>
                      <span>₹{costs.gemCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Making Charge:</span>
                      <span>₹{costs.making.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wastage Cost:</span>
                      <span>₹{costs.wastageCost.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Cost:</span>
                      <span className="text-[#C89B34]">₹{costs.finalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-3 mt-8 pb-8">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            className="px-6"
          >
            <Save className="h-4 w-4 mr-2" />
            {labels.saveDraft}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('saveAndAdd')}
            className="px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            {labels.saveAddAnother}
          </Button>
          <Button
            onClick={() => handleSave('save')}
            className="px-6 bg-[#C89B34] hover:bg-[#B8893A] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {labels.save}
          </Button>
        </div>

        {/* Variant Editor Dialog */}
        <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Variant: {editingVariant?.name}</DialogTitle>
            </DialogHeader>
            {editingVariant && (
              <VariantEditor
                variant={editingVariant}
                onUpdate={setEditingVariant}
                onSave={handleSaveVariant}
                onCancel={() => {
                  setIsVariantDialogOpen(false);
                  setEditingVariant(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Variant Editor Component
interface VariantEditorProps {
  variant: VariantUI;
  onUpdate: (variant: VariantUI) => void;
  onSave: () => void;
  onCancel: () => void;
}

function VariantEditor({ variant, onUpdate, onSave, onCancel }: VariantEditorProps) {
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedGemstone, setSelectedGemstone] = useState('');
  const [isAddingGemstone, setIsAddingGemstone] = useState(false);

  const updateVariant = (updates: Partial<VariantUI>) => {
    onUpdate({ ...variant, ...updates });
  };

  const addMaterial = () => {
    const material = mockMaterials.find(m => m.id === selectedMaterial);
    if (!material) return;

    const newMaterial: MaterialSnapshot = {
      materialId: material.id,
      name: material.name,
      purity: material.purity,
      weight: 1,
      rate: material.defaultRate,
      totalCost: material.defaultRate
    };

    updateVariant({
      materials: [...variant.materials, newMaterial]
    });
    setSelectedMaterial('');
    setIsAddingMaterial(false);
  };

  const updateMaterial = (index: number, updates: Partial<MaterialSnapshot>) => {
    const updatedMaterials = variant.materials.map((mat, i) => {
      if (i === index) {
        const updated = { ...mat, ...updates };
        updated.totalCost = updated.weight * updated.rate;
        return updated;
      }
      return mat;
    });
    updateVariant({ materials: updatedMaterials });
  };

  const removeMaterial = (index: number) => {
    updateVariant({
      materials: variant.materials.filter((_, i) => i !== index)
    });
  };

  const addGemstone = () => {
    const gemstone = mockGemstones.find(g => g.id === selectedGemstone);
    if (!gemstone) return;

    const newGemstone: GemstoneSnapshot = {
      gemstoneId: gemstone.id,
      name: gemstone.name,
      caratWeight: 0.5,
      rate: gemstone.defaultRate,
      totalCost: gemstone.defaultRate * 0.5
    };

    updateVariant({
      gemstones: [...variant.gemstones, newGemstone]
    });
    setSelectedGemstone('');
    setIsAddingGemstone(false);
  };

  const updateGemstone = (index: number, updates: Partial<GemstoneSnapshot>) => {
    const updatedGemstones = variant.gemstones.map((gem, i) => {
      if (i === index) {
        const updated = { ...gem, ...updates };
        updated.totalCost = updated.caratWeight * updated.rate;
        return updated;
      }
      return gem;
    });
    updateVariant({ gemstones: updatedGemstones });
  };

  const removeGemstone = (index: number) => {
    updateVariant({
      gemstones: variant.gemstones.filter((_, i) => i !== index)
    });
  };

  // Calculate total weight
  const totalWeight = variant.materials.reduce((sum, mat) => sum + mat.weight, 0);
  
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Variant Name</Label>
          <Input
            value={variant.name}
            onChange={(e) => updateVariant({ name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>SKU</Label>
          <Input
            value={variant.sku}
            onChange={(e) => updateVariant({ sku: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Total Weight: {totalWeight}g</Label>
          <div className="text-sm text-gray-600 mt-1">Calculated from materials</div>
        </div>
        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={variant.quantity}
            onChange={(e) => updateVariant({ quantity: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Materials Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Materials</h4>
          <Popover open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
            <PopoverTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-medium">Add Material</h4>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMaterials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} ({material.purity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addMaterial} disabled={!selectedMaterial}>
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingMaterial(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-3">
          {variant.materials.map((material, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div>
                  <Label className="text-xs">Material</Label>
                  <div className="font-medium">{material.name}</div>
                  <div className="text-sm text-gray-600">({material.purity})</div>
                </div>
                <div>
                  <Label className="text-xs">Weight (g)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={material.weight}
                    onChange={(e) => updateMaterial(index, { weight: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Rate (₹/g)</Label>
                  <Input
                    type="number"
                    value={material.rate}
                    onChange={(e) => updateMaterial(index, { rate: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Total Cost</Label>
                  <div className="font-medium text-[#C89B34] mt-1">
                    ₹{material.totalCost.toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                  className="mt-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Gemstones Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Gemstones</h4>
          <Popover open={isAddingGemstone} onOpenChange={setIsAddingGemstone}>
            <PopoverTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Gemstone
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-medium">Add Gemstone</h4>
                <Select value={selectedGemstone} onValueChange={setSelectedGemstone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gemstone" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGemstones.map((gemstone) => (
                      <SelectItem key={gemstone.id} value={gemstone.id}>
                        {gemstone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addGemstone} disabled={!selectedGemstone}>
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingGemstone(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-3">
          {variant.gemstones.map((gemstone, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div>
                  <Label className="text-xs">Gemstone</Label>
                  <div className="font-medium">{gemstone.name}</div>
                </div>
                <div>
                  <Label className="text-xs">Weight (ct)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={gemstone.caratWeight}
                    onChange={(e) => updateGemstone(index, { caratWeight: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Rate (₹/ct)</Label>
                  <Input
                    type="number"
                    value={gemstone.rate}
                    onChange={(e) => updateGemstone(index, { rate: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Total Cost</Label>
                  <div className="font-medium text-[#C89B34] mt-1">
                    ₹{gemstone.totalCost.toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGemstone(index)}
                  className="mt-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} className="bg-[#C89B34] hover:bg-[#B8893A] text-white">
          Save Changes
        </Button>
      </div>
    </div>
  );
}