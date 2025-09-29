'use client'
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Gem,
  Zap,
  CreditCard,
  Info
} from "lucide-react";
import { useInventoryItem } from "@/hooks/inventory/use-inventory";
import { InventoryItem } from "@/lib/types/inventory/inventory";
import { InventoryItemStatus } from "@/generated/prisma";
import { 
  formatPriceRupees, 
  formatWeightGrams, 
  mgToGrams, 
  paiseToRupees 
} from "@/lib/utils/inventory/utils";

interface ViewInventoryPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryId: string | null;
}

const StatusBadgeVariant: Record<InventoryItemStatus, "default" | "secondary" | "destructive"> = {
  [InventoryItemStatus.IN_STOCK]: "default",
  [InventoryItemStatus.LOW_STOCK]: "secondary", 
  [InventoryItemStatus.OUT_OF_STOCK]: "destructive",
} as const;

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/4" />
    </div>
    
    <Separator />
    
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
    
    <Separator />
    
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  </div>
);

const InfoRow: React.FC<{ 
  label: string; 
  value: React.ReactNode;
  className?: string;
}> = ({ label, value, className }) => (
  <div className={`${className}`}>
    <span className="text-sm font-medium text-foreground">{label}: </span>
    <span className="text-sm text-muted-foreground">{value}</span>
  </div>
);

const MaterialsTable: React.FC<{ materials: InventoryItem['materials'] }> = ({ materials }) => {
  // Convert API data (mg/paise) to UI data (grams/rupees) for calculations
  const materialsUIData = materials.map(material => ({
    id: material.material.id,
    name: material.material.name,
    weight: mgToGrams(material.weight), // Convert mg to grams
    price: paiseToRupees(material.buyingPrice), // Convert paise to rupees
    total: mgToGrams(material.weight) * paiseToRupees(material.buyingPrice)
  }));

  const totalWeight = materialsUIData.reduce((sum, m) => sum + m.weight, 0);
  const totalCost = materialsUIData.reduce((sum, m) => sum + m.total, 0);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center space-x-2">
        <Zap className="h-4 w-4" />
        <span>Materials</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <div className="space-y-1 text-xs">
                <div className="font-semibold mb-2">Materials Breakdown:</div>
                {materialsUIData.map((material, index) => (
                  <div key={material.id} className="flex justify-between">
                    <span>{material.name} ({material.weight.toFixed(3)}g × ₹{material.price.toFixed(2)}):</span>
                    <span>₹{material.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between">
                    <span>Total Weight:</span>
                    <span>{totalWeight.toFixed(3)}g</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Materials used in this inventory item with their individual costs
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h4>
      <div className="border rounded-lg">
        <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 text-xs font-medium">
          <div>Material</div>
          <div>Weight</div>
          <div>Rate</div>
          <div className="text-right">Total</div>
        </div>
        {materials.map((material, index) => (
          <div key={material.id} className={`grid grid-cols-4 gap-2 p-3 text-sm ${
            index !== materials.length - 1 ? 'border-b' : ''
          }`}>
            <div className="space-y-1">
              <div className="font-medium">{material.material.name}</div>
              <div className="text-xs text-muted-foreground">
                {material.material.type} - {material.material.purity}
              </div>
            </div>
            <div>{mgToGrams(material.weight).toFixed(3)}g</div>
            <div>₹{paiseToRupees(material.buyingPrice).toFixed(2)}</div>
            <div className="text-right font-medium">
              ₹{(mgToGrams(material.weight) * paiseToRupees(material.buyingPrice)).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GemstonesTable: React.FC<{ gemstones: InventoryItem['gemstones'] }> = ({ gemstones }) => {
  if (!gemstones || gemstones.length === 0) return null;

  // Convert API data (mg/paise) to UI data (grams/rupees) for calculations
  const gemstonesUIData = gemstones.map(gemstone => ({
    id: gemstone.gemstone.id,
    name: gemstone.gemstone.name,
    weight: mgToGrams(gemstone.weight), // Convert mg to grams
    price: paiseToRupees(gemstone.buyingPrice), // Convert paise to rupees
    total: mgToGrams(gemstone.weight) * paiseToRupees(gemstone.buyingPrice)
  }));

  const totalWeight = gemstonesUIData.reduce((sum, g) => sum + g.weight, 0);
  const totalCost = gemstonesUIData.reduce((sum, g) => sum + g.total, 0);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center space-x-2">
        <Gem className="h-4 w-4" />
        <span>Gemstones</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <div className="space-y-1 text-xs">
                <div className="font-semibold mb-2">Gemstones Breakdown:</div>
                {gemstonesUIData.map((gemstone, index) => (
                  <div key={gemstone.id} className="flex justify-between">
                    <span>{gemstone.name} ({gemstone.weight.toFixed(3)}g × ₹{gemstone.price.toFixed(2)}):</span>
                    <span>₹{gemstone.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between">
                    <span>Total Weight:</span>
                    <span>{totalWeight.toFixed(3)}g</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Gemstones used in this inventory item with their individual costs
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h4>
      <div className="border rounded-lg">
        <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 text-xs font-medium">
          <div>Gemstone</div>
          <div>Weight</div>
          <div>Rate</div>
          <div className="text-right">Total</div>
        </div>
        {gemstones.map((gemstone, index) => (
          <div key={gemstone.id} className={`grid grid-cols-4 gap-2 p-3 text-sm ${
            index !== gemstones.length - 1 ? 'border-b' : ''
          }`}>
            <div className="space-y-1">
              <div className="font-medium">{gemstone.gemstone.name}</div>
              <div className="text-xs text-muted-foreground">
                {gemstone.gemstone.shape} - {gemstone.gemstone.clarity} - {gemstone.gemstone.color}
              </div>
            </div>
            <div>{mgToGrams(gemstone.weight).toFixed(3)}g</div>
            <div>₹{paiseToRupees(gemstone.buyingPrice).toFixed(2)}</div>
            <div className="text-right font-medium">
              ₹{(mgToGrams(gemstone.weight) * paiseToRupees(gemstone.buyingPrice)).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingSection: React.FC<{ item: InventoryItem }> = ({ item }) => {
  // Convert API data to UI data for calculations - exactly like SummarySection
  const materials = item.materials.map(m => ({
    weight: mgToGrams(m.weight), // Convert mg to grams (UI units)
    buyingPrice: paiseToRupees(m.buyingPrice) // Convert paise to rupees (UI units)
  }));

  const gemstones = item.gemstones?.map(g => ({
    weight: mgToGrams(g.weight), // Convert mg to grams (UI units)
    buyingPrice: paiseToRupees(g.buyingPrice) // Convert paise to rupees (UI units)
  })) || [];

  // Convert item values to UI units
  const wastage = item.wastage || 0;
  const buyingPrice = paiseToRupees(item.buyingPrice);
  const sellingPrice = paiseToRupees(item.sellingPrice);
  const makingChargeType = item.makingChargeType;
  const makingChargeValue = item.makingChargeValue;
  const grossWeight = mgToGrams(item.grossWeight);

  // Calculate making charge - exactly like SummarySection
  const makingChargeAmount = React.useMemo(() => {
    if (makingChargeType === 'PERCENTAGE') {
      return (buyingPrice * makingChargeValue) / 100;
    } else if (makingChargeType === 'PER_GRAM') {
      return grossWeight * makingChargeValue;
    }
    return makingChargeValue;
  }, [makingChargeType, makingChargeValue, buyingPrice, grossWeight]);

  // Calculate selling price breakdown - exactly like SummarySection
  const sellPriceBreakdown = React.useMemo(() => {
    const materialsCost = materials.reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0);
    const gemstonesCost = gemstones.reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0);
    const wastageAmount = buyingPrice * (wastage / 100);
    const materialsGST = materialsCost * 0.03;
    const gemstonesGST = gemstonesCost * 0.03;
    const makingChargeGST = makingChargeAmount * 0.05;

    const total = buyingPrice + makingChargeAmount + wastageAmount + materialsGST + gemstonesGST + makingChargeGST;

    return {
      buyingCost: buyingPrice,
      makingCharge: makingChargeAmount,
      wastage: wastageAmount,
      materialsGST,
      gemstonesGST,
      makingChargeGST,
      total
    };
  }, [buyingPrice, makingChargeAmount, wastage, materials, gemstones]);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm flex items-center space-x-2">
        <CreditCard className="h-4 w-4" />
        <span>Pricing Breakdown</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <div className="space-y-1 text-xs">
                <div className="font-semibold mb-2">Price Breakdown:</div>
                <div className="flex justify-between">
                  <span>Buying Cost:</span>
                  <span>₹{sellPriceBreakdown.buyingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Making Charge:</span>
                  <span>₹{sellPriceBreakdown.makingCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wastage ({wastage}%):</span>
                  <span>₹{sellPriceBreakdown.wastage.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materials GST (3%):</span>
                  <span>₹{sellPriceBreakdown.materialsGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gemstones GST (3%):</span>
                  <span>₹{sellPriceBreakdown.gemstonesGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Making Charge GST (5%):</span>
                  <span>₹{sellPriceBreakdown.makingChargeGST.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹{sellPriceBreakdown.total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Auto-calculated based on buying prices, wastage, making charges and GST
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h4>
      
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span>Material Cost</span>
          <span className="font-medium">₹{materials.reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0).toFixed(2)}</span>
        </div>
        
        {gemstones.length > 0 && gemstones.reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span>Gemstone Cost</span>
            <span className="font-medium">₹{gemstones.reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0).toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span>
            Making Charges 
            {makingChargeType === 'PERCENTAGE' && ` (${makingChargeValue}%)`}
            {makingChargeType === 'PER_GRAM' && ` (₹${makingChargeValue.toFixed(2)}/g)`}
          </span>
          <span className="font-medium">₹{makingChargeAmount.toFixed(2)}</span>
        </div>
        
        {wastage > 0 && (
          <div className="flex justify-between text-sm">
            <span>Wastage ({wastage}%)</span>
            <span className="font-medium">₹{sellPriceBreakdown.wastage.toFixed(2)}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between text-sm">
          <span>Buying Price</span>
          <span className="font-semibold">₹{buyingPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between font-semibold text-lg">
          <span>Selling Price:</span>
          <span>₹{sellingPrice.toFixed(2)}</span>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Making Charge:</span>
              <span>₹{makingChargeAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wastage:</span>
              <span>₹{(buyingPrice * (wastage / 100)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span>{item.location || 'Not set'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span>{item.quantity}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Calculated Price:</span>
              <span>₹{sellPriceBreakdown.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ViewInventoryPopover: React.FC<ViewInventoryPopoverProps> = ({
  isOpen,
  onClose,
  inventoryId,
}) => {
  const { data, isLoading, error } = useInventoryItem(inventoryId || '');
  const item = data?.item;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="!w-[400px] sm:!w-[500px] lg:!w-[600px] !max-w-none data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full border-l p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-left">Inventory Details</SheetTitle>
          <SheetDescription className="text-left">
            View complete information about this inventory item
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)]">
          {isLoading && <LoadingSkeleton />}
          
          {error && (
            <div className="p-6 text-center">
              <div className="text-destructive text-sm">
                Failed to load inventory details
              </div>
            </div>
          )}
          
          {item && (
            <div className="space-y-6 p-6">
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                  <Badge variant={StatusBadgeVariant[item.status]}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>

              <Separator />

              {/* Basic Information - Reorganized Layout */}
              <div className="space-y-4">
                {/* Row 1: Gross Weight, Quantity */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-2">
                    <InfoRow 
                      label="Gross Wt"
                      value={`${mgToGrams(item.grossWeight).toFixed(3)}g`}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80">
                          <div className="space-y-1 text-xs">
                            <div className="font-semibold mb-2">Gross Weight Breakdown:</div>
                            {item.materials.filter(m => m.weight > 0).map((material, index) => (
                              <div key={material.id} className="flex justify-between">
                                <span>{material.material.name}:</span>
                                <span>{mgToGrams(material.weight).toFixed(3)}g</span>
                              </div>
                            ))}
                            {item.gemstones && item.gemstones.filter(g => g.weight > 0).map((gemstone, index) => (
                              <div key={gemstone.id} className="flex justify-between">
                                <span>{gemstone.gemstone.name}:</span>
                                <span>{mgToGrams(gemstone.weight).toFixed(3)}g</span>
                              </div>
                            ))}
                            <div className="border-t pt-1 mt-2">
                              <div className="flex justify-between">
                                <span>Materials Total:</span>
                                <span>{mgToGrams(item.materials.reduce((sum, m) => sum + m.weight, 0)).toFixed(3)}g</span>
                              </div>
                              {item.gemstones && item.gemstones.length > 0 && (
                                <div className="flex justify-between">
                                  <span>Gemstones Total:</span>
                                  <span>{mgToGrams(item.gemstones.reduce((sum, g) => sum + g.weight, 0)).toFixed(3)}g</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold">
                                <span>Total Gross Weight:</span>
                                <span>{mgToGrams(item.grossWeight).toFixed(3)}g</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Gross weight includes materials and gemstones without wastage
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <InfoRow 
                    label="Quantity"
                    value={item.quantity}
                  />
                </div>

                {/* Row 2: HSN Code, HUID */}
                <div className="grid grid-cols-2 gap-6">
                  {item.hsnCode ? (
                    <InfoRow 
                      label="HSN"
                      value={item.hsnCode}
                    />
                  ) : (
                    <div></div>
                  )}
                  
                  {item.huid ? (
                    <InfoRow 
                      label="HUID"
                      value={item.huid}
                    />
                  ) : (
                    <div></div>
                  )}
                </div>

                {/* Row 3: Category, Brand */}
                <div className="grid grid-cols-2 gap-6">
                  <InfoRow 
                    label="Category"
                    value={item.category.name}
                  />
                  
                  {item.brand ? (
                    <InfoRow 
                      label="Brand"
                      value={item.brand.name}
                    />
                  ) : (
                    <div></div>
                  )}
                </div>

                {/* Row 4: Supplier, Location */}
                <div className="grid grid-cols-2 gap-6">
                  
                  {item.location ? (
                    <InfoRow 
                      label="Location"
                      value={item.location}
                    />
                  ) : (
                    <div></div>
                  )}

                  {item.supplier ? (
                    <InfoRow 
                      label="Supplier"
                      value={item.supplier.name}
                    />
                  ) : (
                    <div></div>
                  )}
                </div>

                {/* Row 5: Pricing Summary */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-2">
                    <InfoRow 
                      label="Buy Price"
                      value={`₹${paiseToRupees(item.buyingPrice).toFixed(2)}`}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80">
                          <div className="space-y-1 text-xs">
                            <div className="font-semibold mb-2">Buying Price Breakdown:</div>
                            <div className="flex justify-between">
                              <span>Materials Cost:</span>
                              <span>₹{item.materials.reduce((sum, m) => sum + (mgToGrams(m.weight) * paiseToRupees(m.buyingPrice)), 0).toFixed(2)}</span>
                            </div>
                            {item.gemstones && item.gemstones.length > 0 && (
                              <div className="flex justify-between">
                                <span>Gemstones Cost:</span>
                                <span>₹{item.gemstones.reduce((sum, g) => sum + (mgToGrams(g.weight) * paiseToRupees(g.buyingPrice)), 0).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t pt-1 mt-2">
                              <div className="flex justify-between font-semibold">
                                <span>Total Buying Price:</span>
                                <span>₹{paiseToRupees(item.buyingPrice).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              This is the total cost price including materials and gemstones
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <InfoRow 
                    label="Sell Price"
                    value={`₹${paiseToRupees(item.sellingPrice).toFixed(2)}`}
                  />
                </div>
              </div>

              <Separator />

              {/* Materials */}
              <MaterialsTable materials={item.materials} />

              {/* Gemstones */}
              <GemstonesTable gemstones={item.gemstones} />

              <Separator />

              {/* Pricing */}
              <PricingSection item={item} />

              <Separator />

              {/* Metadata */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Additional Information</h4>
                <div className="space-y-3">
                  {/* Row 1: Created By, Created At */}
                  <div className="grid grid-cols-2 gap-6">
                    <InfoRow 
                      label="Created By"
                      value={item.createdBy.name}
                    />
                    <InfoRow 
                      label="Created"
                      value={new Date(item.createdAt).toLocaleDateString()}
                    />
                  </div>
                  
                  {/* Row 2: Last Updated By, Last Updated */}
                  <div className="grid grid-cols-2 gap-6">
                    <InfoRow 
                      label="Updated By"
                      value={item.updatedBy.name}
                    />
                    <InfoRow 
                      label="Updated"
                      value={new Date(item.updatedAt).toLocaleDateString()}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};