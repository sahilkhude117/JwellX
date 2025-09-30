'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStockAdjustmentSchema, CreateStockAdjustmentData } from '@/lib/types/inventory/inventory';
import { useCreateStockAdjustment } from '@/hooks/inventory/use-inventory';
import { InventoryItem } from '@/lib/types/inventory/inventory';

interface AdjustStockPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: InventoryItem | null;
}

export const AdjustStockPopover: React.FC<AdjustStockPopoverProps> = ({
  isOpen,
  onClose,
  inventoryItem,
}) => {
  const createStockAdjustment = useCreateStockAdjustment();

  const form = useForm<CreateStockAdjustmentData>({
    resolver: zodResolver(createStockAdjustmentSchema),
    defaultValues: {
      inventoryItemId: '',
      adjustment: 0,
      reason: '',
    },
  });

  // Reset form when inventory item changes
  useEffect(() => {
    if (inventoryItem) {
      form.reset({
        inventoryItemId: inventoryItem.id,
        adjustment: 0,
        reason: '',
      });
    }
  }, [inventoryItem, form]);

  const onSubmit = async (data: CreateStockAdjustmentData) => {
    // Prevent submission if it would result in negative stock
    if (newQuantity < 0) {
      form.setError('adjustment', {
        type: 'manual',
        message: 'Adjustment cannot result in negative stock',
      });
      return;
    }

    try {
      await createStockAdjustment.mutateAsync(data);
      form.reset();
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const currentQuantity = inventoryItem?.quantity || 0;
  const adjustmentValue = form.watch('adjustment') || 0;
  const newQuantity = currentQuantity + adjustmentValue;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>
        
        {inventoryItem && (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium">{inventoryItem.name}</h4>
              <p className="text-sm text-muted-foreground">SKU: {inventoryItem.sku}</p>
              <p className="text-sm text-muted-foreground">Current Quantity: {currentQuantity}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="adjustment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter adjustment amount (+ or -)"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? 0 : parseInt(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-sm text-muted-foreground">
                        <p>• Use positive numbers to add stock (e.g., +5 for receiving new items)</p>
                        <p>• Use negative numbers to reduce stock (e.g., -3 for damaged items)</p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter reason for stock adjustment"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">New Quantity:</span>
                    <span className={`text-sm font-bold ${newQuantity < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {newQuantity}
                    </span>
                  </div>
                  {newQuantity < 0 && (
                    <p className="text-sm text-destructive mt-1">
                      Warning: This adjustment will result in negative stock
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={createStockAdjustment.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createStockAdjustment.isPending || newQuantity < 0}
                  >
                    {createStockAdjustment.isPending ? 'Adjusting...' : 'Adjust Stock'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};