import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { CreateInventoryItemData } from '@/lib/types/inventory/inventory';
import { ChargeType } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, AlertTriangle } from 'lucide-react';
import { calculateGrossWeight, calculateSellingPrice, calculateSellingPriceBreakdown, paiseToRupees, roundToTwoDecimals, formatPriceRupees, formatWeightGrams } from '@/lib/utils/inventory/utils';

interface SummarySectionProps {
  control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
  watch: any;
  setValue: any;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ control, watch, setValue }) => {
  const materials = watch('materials') || [];
  const gemstones = watch('gemstones') || [];
  const wastage = watch('wastage') || 0;
  const buyingPrice = watch('buyingPrice') || 0;
  const makingChargeType = watch('makingChargeType');
  const makingChargeValue = watch('makingChargeValue') || 0;
  const quantity = watch('quantity') || 1;
  const location = watch('location') || '';

  const calculatedGrossWeight = React.useMemo(() => {
    // Calculate in grams (display units)
    const materialsWeight = materials.reduce((sum: number, m: any) => sum + (m.weight || 0), 0);
    const gemstonesWeight = gemstones.reduce((sum: number, g: any) => sum + (g.weight || 0), 0);
    return roundToTwoDecimals(materialsWeight + gemstonesWeight);
  }, [materials, gemstones]);

  const makingChargeAmount = React.useMemo(() => {
    if (makingChargeType === ChargeType.PERCENTAGE) {
      return (buyingPrice * makingChargeValue) / 100;
    } else if (makingChargeType === ChargeType.PER_GRAM) {
      return calculatedGrossWeight * makingChargeValue;
    }
    return makingChargeValue;
  }, [makingChargeType, makingChargeValue, buyingPrice, calculatedGrossWeight]);

  // Calculate selling price in display units (rupees)
  const calculatedSellingPrice = React.useMemo(() => {
    // Calculate in rupees (display units)
    const wastageAmount = buyingPrice * (wastage / 100);
    const materialsGST = materials.reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0) * 0.03;
    const gemstonesGST = gemstones.reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0) * 0.03;
    const makingChargeGST = makingChargeAmount * 0.05;

    return buyingPrice + makingChargeAmount + wastageAmount + materialsGST + gemstonesGST + makingChargeGST;
  }, [buyingPrice, makingChargeAmount, wastage, materials, gemstones]);

  // Calculate selling price breakdown in display units
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

  React.useEffect(() => {
    setValue('grossWeight', calculatedGrossWeight);
  }, [calculatedGrossWeight, control]);

  React.useEffect(() => {
    setValue('sellingPrice', roundToTwoDecimals(calculatedSellingPrice));
  }, [calculatedSellingPrice, control]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="grossWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Gross Weight (g)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent className="w-80">
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold mb-2">Gross Weight Breakdown:</div>
                        {materials.filter((m: any) => m.materialId && m.weight > 0).map((material: any, index: number) => (
                          <div key={`${material.materialId}-${index}`} className="flex justify-between">
                            <span>Material {index + 1}:</span>
                            <span>{material.weight}g</span>
                          </div>
                        ))}
                        {gemstones.filter((g: any) => g.gemstoneId && g.weight > 0).map((gemstone: any, index: number) => (
                          <div key={`${gemstone.gemstoneId}-${index}`} className="flex justify-between">
                            <span>Gemstone {index + 1}:</span>
                            <span>{gemstone.weight}g</span>
                          </div>
                        ))}
                        <div className="border-t pt-1 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Gross Weight:</span>
                            <span>{calculatedGrossWeight.toFixed(2)}g</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Auto-calculated based on materials and gemstones weight (no wastage). Edit to enter actual weight.
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
          control={control}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Selling Price (Temporary)
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
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <div className="flex items-center gap-1 items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                <FormDescription className="text-xs text-amber-600">
                  This is a temporary price based on given buying prices, wastage, making charge and GST. At POS, it will fetch the current value of metal.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <span>{location || 'Not set'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Selling Price:</span>
              <span>₹{calculatedSellingPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
