import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { CreateInventoryItemData } from '@/lib/types/inventory/inventory';
import { ChargeType } from '@/generated/prisma';
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
import { Info } from 'lucide-react';
import { calculateGrossWeight, calculateSellingPrice } from '@/lib/utils/inventory/utils';

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
    return calculateGrossWeight(materials, gemstones, wastage);
  }, [materials, gemstones, wastage]);

  const makingChargeAmount = React.useMemo(() => {
    if (makingChargeType === ChargeType.PERCENTAGE) {
      return (buyingPrice * makingChargeValue) / 100;
    } else if (makingChargeType === ChargeType.PER_GRAM) {
      return calculatedGrossWeight * makingChargeValue;
    }
    return makingChargeValue;
  }, [makingChargeType, makingChargeValue, buyingPrice, calculatedGrossWeight]);

  const calculatedSellingPrice = React.useMemo(() => {
    return calculateSellingPrice(buyingPrice, makingChargeAmount, wastage, materials, gemstones);
  }, [buyingPrice, makingChargeAmount, wastage, materials]);

  const sellPriceBreakdown = React.useMemo(() => {
    const wastageAmount = buyingPrice * (wastage / 100);
    interface Material {
      weight: number;
      buyingPrice: number;
      [key: string]: any;
    }

    const materialsGST: number = (materials as Material[]).reduce(
      (sum: number, m: Material) => sum + (m.weight * m.buyingPrice),
      0
    ) * 0.03;
    
    return {
      buyingPrice,
      makingCharge: makingChargeAmount,
      wastage: wastageAmount,
      gst: materialsGST,
      total: calculatedSellingPrice
    };
  }, [buyingPrice, makingChargeAmount, wastage, materials, calculatedSellingPrice]);

  React.useEffect(() => {
    setValue('grossWeight', calculatedGrossWeight);
  }, [calculatedGrossWeight, control]);

  React.useEffect(() => {
    setValue('sellingPrice', calculatedSellingPrice);
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
                    <TooltipContent>
                      <p>Auto-calculated based on materials, gemstones weight and wastage. Edit to enter actual weight.</p>
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
              <FormDescription className="text-xs">
                Calculated: {calculatedGrossWeight.toFixed(2)}g (editable)
              </FormDescription>
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
                Selling Price
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent className="w-64">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Buying Cost:</span>
                          <span>₹{sellPriceBreakdown.buyingPrice.toFixed(2)}</span>
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
                          <span>GST (3%):</span>
                          <span>₹{sellPriceBreakdown.gst.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>₹{sellPriceBreakdown.total.toFixed(2)}</span>
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