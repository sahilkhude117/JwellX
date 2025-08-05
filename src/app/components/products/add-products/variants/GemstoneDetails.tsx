'use client';
import React, { useState } from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, ChevronsUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateProductFormData, GemstoneOption } from '@/lib/types/products/create-products';
import { Label } from '@/components/ui/label';
import GemstoneFormDialog from '../../materials/gemstone-form-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface GemstoneDetailsProps {
  variantIndex: number;
  gemstones: GemstoneOption[];
  isGemstonesLoading: boolean;
}

export default function GemstoneDetails({
  variantIndex,
  gemstones,
  isGemstonesLoading
}: GemstoneDetailsProps) {
  const { control, formState: { errors } } = useFormContext<CreateProductFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.gemstones` as const
  });
  const [isGemstoneDialogOpen, setIsGemstoneDialogOpen] = useState(false);
  
  const handleAddGemstone = () => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      gemstoneId: '',
      caratWeight: 0.5,
      cut: '',
      color: '',
      clarity: '',
      certificationId: '',
      rate: 2500
    });
  };
  
  const handleDeleteGemstone = (gemstoneIndex: number) => {
    remove(gemstoneIndex);
  };

  // Helper function to get gemstone errors
  const getGemstoneError = (gemstoneIndex: number, field: string) => {
    const variantErrors = errors.variants?.[variantIndex];
    if (!variantErrors || !variantErrors.gemstones) return undefined;
    const gemstoneErrors = variantErrors.gemstones[gemstoneIndex];
    if (!gemstoneErrors) return undefined;
    return (gemstoneErrors as any)[field];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Gemstone Details</h3>
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={handleAddGemstone}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Gemstone
        </Button>
      </div>
      
      {fields.map((gemstone, gemstoneIndex) => (
        <div key={gemstone.id} className="border rounded-lg p-4 mb-4 bg-background">
        <div className="space-y-3 mb-3">
        <div className="space-y-1 w-full">
            <Label>Gemstone</Label>
            <div className="relative">
                <Controller
                name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.gemstoneId` as const}
                control={control}
                render={({ field }) => (
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="outline" 
                            role="combobox" 
                            className={`w-full justify-between ${getGemstoneError(gemstoneIndex, 'gemstoneId') ? 'border-destructive' : ''}`}
                        >
                        {field.value 
                            ? gemstones.find(g => g.id === field.value)?.name || "Select gemstone..."
                            : "Select gemstone..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                        <CommandInput placeholder="Search gemstones..." />
                        <CommandList>
                            <CommandEmpty>No gemstones found.</CommandEmpty>
                            <CommandGroup heading="Gemstones">
                            {gemstones.map((gemstone) => (
                                <CommandItem
                                    key={gemstone.id}
                                    value={gemstone.id}
                                    onSelect={(value) => {
                                        field.onChange(value);
                                    }}
                                >
                                {gemstone.name} ({gemstone.shape})
                                </CommandItem>
                            ))}
                            </CommandGroup>
                            <CommandGroup>
                            <CommandItem
                                onSelect={() => setIsGemstoneDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Gemstone
                            </CommandItem>
                            </CommandGroup>
                        </CommandList>
                        </Command>
                    </PopoverContent>
                    </Popover>
                )}
                />           
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
            <Label>Carat Weight</Label>
            <Controller
                name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.caratWeight` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    type="number"
                    step="0.1"
                    className={getGemstoneError(gemstoneIndex, 'caratWeight') ? 'border-destructive' : ''}
                    placeholder="0.0"
                    onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                    }}
                />
                )}
            />
            {getGemstoneError(gemstoneIndex, 'caratWeight') && (
                <span className="text-xs text-destructive mt-1">
                {getGemstoneError(gemstoneIndex, 'caratWeight')?.message}
                </span>
            )}
            </div>
            <div className="space-y-1">
            <Label>Color</Label>
            <Controller
                name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.color` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    placeholder="e.g., D"
                />
                )}
            />
            </div>
            <div className="space-y-1">
            <Label>Clarity</Label>
            <Controller
                name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.clarity` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    placeholder="e.g., VS1"
                />
                )}
            />
            </div>
            <div className="space-y-1 col-span-2">
            <Label>Rate ($/ct)</Label>
            <Controller
                name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.rate` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    type="number"
                    className={getGemstoneError(gemstoneIndex, 'rate') ? 'border-destructive' : ''}
                    placeholder="0.00"
                    onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                    }}
                />
                )}
            />
            {getGemstoneError(gemstoneIndex, 'rate') && (
                <span className="text-xs text-destructive mt-1">
                {getGemstoneError(gemstoneIndex, 'rate')?.message}
                </span>
            )}
            </div>
            <div className="space-y-1 col-span-2">
            <Label>Cut</Label>
            <Controller
                name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.cut` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    placeholder="e.g., Excellent"
                />
                )}
            />
            </div>
        </div>
        </div>
          <div className="flex justify-end">
            <Button 
              type="button"
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteGemstone(gemstoneIndex)}
            >
              Remove Gemstone
            </Button>
          </div>
        </div>
      ))}

      <GemstoneFormDialog
            open={isGemstoneDialogOpen}
            onOpenChange={() => setIsGemstoneDialogOpen(false)}
        />
    </div>
  );
}