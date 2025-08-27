import React from 'react';
import { Control } from 'react-hook-form';
import { CreateInventoryItemData } from '@/lib/types/inventory/inventory';
import { ChargeType } from '@/generated/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateBuyingCost } from '@/lib/utils/inventory/utils';

interface PricingSectionProps {
  control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
  watch: any;
  setValue: any;
  getValues: any;
  locations: Array<{ value: string; label: string }>;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  control,
  watch,
  setValue,
  getValues,
  locations
}) => {
  const materials = watch('materials') || [];
  const gemstones = watch('gemstones') || [];
  
  const calculatedBuyingCost = React.useMemo(() => {
    return calculateBuyingCost(materials, gemstones);
  }, [materials, gemstones]);

  React.useEffect(() => {
    // Auto-set buying cost but keep it editable
    if (calculatedBuyingCost > 0) {
      const currentBuyingPrice = getValues('buyingPrice');
      if (!currentBuyingPrice || currentBuyingPrice === 0) {
        setValue('buyingPrice', calculatedBuyingCost);
      }
    }
  }, [calculatedBuyingCost, control]);

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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  step="0.1"
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buying Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Enter the price at which you bought this item for profit calculations
                {calculatedBuyingCost > 0 && (
                  <span className="block mt-1">
                    Auto-calculated: ₹{calculatedBuyingCost.toFixed(2)}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="makingChargeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Making Charge Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ChargeType.PERCENTAGE}>Percentage</SelectItem>
                    <SelectItem value={ChargeType.FIXED}>Fixed Amount</SelectItem>
                    <SelectItem value={ChargeType.PER_GRAM}>Per Gram</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="makingChargeValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Making Charge</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};