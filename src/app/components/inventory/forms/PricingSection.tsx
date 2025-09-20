import React from 'react';
import { Control } from 'react-hook-form';
import { CreateInventoryItemData } from '@/lib/types/inventory/inventory';
import { ChargeType } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { calculateBuyingCost, calculateBuyingCostBreakdown, paiseToRupees, roundToTwoDecimals, formatPriceRupees } from '@/lib/utils/inventory/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Info } from 'lucide-react';
import LocationSelector from '../selectors/location-selector';
import MakingChargeTypeSelector from '../selectors/making-charge-type-selector';

interface PricingSectionProps {
  control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
  watch: any;
  setValue: any;
  getValues: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  control,
  watch,
  setValue,
  getValues
}) => {
  const materials = watch('materials') || [];
  const gemstones = watch('gemstones') || [];

  // State for real-time updates
  const [buyingCostBreakdown, setBuyingCostBreakdown] = React.useState<any>(null);
  const [grossWeightBreakdown, setGrossWeightBreakdown] = React.useState<any>(null);

  // Real-time update function for buying cost breakdown
  const updateBuyingCostBreakdown = React.useCallback(() => {
    const validMaterials = materials.filter((m: any) => m && m.materialId && (m.weight || 0) > 0 && (m.buyingPrice || 0) > 0);
    const validGemstones = gemstones.filter((g: any) => g && g.gemstoneId && (g.weight || 0) > 0 && (g.buyingPrice || 0) > 0);

    if (validMaterials.length === 0 && validGemstones.length === 0) {
      setBuyingCostBreakdown(null);
      return;
    }

    const materialsBreakdown = validMaterials.map((m: any) => {
      const weight = parseFloat(m.weight) || 0;
      const price = parseFloat(m.buyingPrice) || 0;
      const total = roundToTwoDecimals(weight * price);
      return {
        id: m.materialId,
        weight,
        price,
        total
      };
    });

    const gemstonesBreakdown = validGemstones.map((g: any) => {
      const weight = parseFloat(g.weight) || 0;
      const price = parseFloat(g.buyingPrice) || 0;
      const total = roundToTwoDecimals(weight * price);
      return {
        id: g.gemstoneId,
        weight,
        price,
        total
      };
    });

    const materialsTotal = materialsBreakdown.reduce((sum: number, m: any) => sum + (m.total || 0), 0);
    const gemstonesTotal = gemstonesBreakdown.reduce((sum: number, g: any) => sum + (g.total || 0), 0);
    const total = roundToTwoDecimals(materialsTotal + gemstonesTotal);

    setBuyingCostBreakdown({
      materials: materialsBreakdown,
      gemstones: gemstonesBreakdown,
      materialsTotal,
      gemstonesTotal,
      total
    });
  }, [materials, gemstones]);

  // Real-time update function for gross weight breakdown
  const updateGrossWeightBreakdown = React.useCallback(() => {
    const validMaterials = materials.filter((m: any) => m.materialId && m.weight > 0);
    const validGemstones = gemstones.filter((g: any) => g.gemstoneId && g.weight > 0);

    if (validMaterials.length === 0 && validGemstones.length === 0) {
      setGrossWeightBreakdown(null);
      return;
    }

    const materialsWeight = validMaterials.reduce((sum: number, m: any) => sum + m.weight, 0);
    const gemstonesWeight = validGemstones.reduce((sum: number, g: any) => sum + g.weight, 0);
    const total = materialsWeight + gemstonesWeight;

    setGrossWeightBreakdown({
      materialsWeight,
      gemstonesWeight,
      total
    });
  }, [materials, gemstones]);

  // Update breakdowns when materials or gemstones change
  React.useEffect(() => {
    updateBuyingCostBreakdown();
    updateGrossWeightBreakdown();
  }, [
    materials, 
    gemstones, 
    JSON.stringify(materials.map((m: { weight: any; buyingPrice: any; }) => ({ weight: m.weight, buyingPrice: m.buyingPrice }))), 
    JSON.stringify(gemstones.map((g: { weight: any; buyingPrice: any; }) => ({ weight: g.weight, buyingPrice: g.buyingPrice }))),
    updateBuyingCostBreakdown, 
    updateGrossWeightBreakdown
  ]);

  React.useEffect(() => {
    // Auto-set buying cost but keep it editable
    if (buyingCostBreakdown && buyingCostBreakdown.total > 0) {
      const currentBuyingPrice = getValues('buyingPrice');
      if (!currentBuyingPrice || currentBuyingPrice === 0) {
        setValue('buyingPrice', buyingCostBreakdown.total);
      }
    }
  }, [buyingCostBreakdown, setValue, getValues]);

  React.useEffect(() => {
    // Auto-set gross weight
    if (grossWeightBreakdown && grossWeightBreakdown.total > 0) {
      setValue('grossWeight', grossWeightBreakdown.total);
    }
  }, [grossWeightBreakdown, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="location"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <LocationSelector
                      value={field.value || null}
                      onChange={field.onChange}
                      showBadge={false}
                      className={`flex-1 ${fieldState.error ? 'border-red-500' : ''}`}
                    />
                    {fieldState.error && (
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{fieldState.error.message}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="wastage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wastage (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0.0"
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
          name="buyingPrice"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Buying Cost
                {buyingCostBreakdown && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent className="w-80">
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold mb-2">Buying Cost Breakdown:</div>
                        {buyingCostBreakdown.materials.map((material: any, index: number) => (
                          <div key={material.id || index} className="flex justify-between">
                            <span>Material {index + 1} ({material.weight}g × ₹{material.price}):</span>
                            <span>₹{material.total.toFixed(2)}</span>
                          </div>
                        ))}
                        {buyingCostBreakdown.gemstones.map((gemstone: any, index: number) => (
                          <div key={gemstone.id || index} className="flex justify-between">
                            <span>Gemstone {index + 1} ({gemstone.weight}g × ₹{gemstone.price}):</span>
                            <span>₹{isNaN(gemstone.total) ? '0.00' : gemstone.total.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-1 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Buying Cost:</span>
                            <span>₹{buyingCostBreakdown.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Auto-calculated based on buying prices, wastage, making charges and GST
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    className={`${fieldState.error ? 'border-red-500' : ''}`}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                  {fieldState.error && (
                      <Tooltip>
                          <TooltipTrigger>
                              <AlertCircle className="h-3 w-3 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                              <p className="text-xs">{fieldState.error.message}</p>
                          </TooltipContent>
                      </Tooltip>
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-xs">
                Enter the price at which you bought this item for profit calculations
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="makingChargeType"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Making Charge Type</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <MakingChargeTypeSelector
                      value={field.value || null}
                      onChange={field.onChange}
                      showBadge={false}
                      className={`flex-1 ${fieldState.error ? 'border-red-500' : ''}`}
                    />
                    {fieldState.error && (
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{fieldState.error.message}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="makingChargeValue"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Making Charge</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"

                      placeholder="0.00"
                      className={`${fieldState.error ? 'border-red-500' : ''}`}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    {fieldState.error && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className="h-3 w-3 text-red-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">{fieldState.error.message}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
