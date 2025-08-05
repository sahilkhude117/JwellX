'use client';
import React, { useState } from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, ChevronsUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateProductFormData, MaterialOption } from '@/lib/types/products/create-products';
import { Label } from '@/components/ui/label';
import MaterialFormDialog from '../../materials/material-form-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface MaterialCompositionProps {
  variantIndex: number;
  materials: MaterialOption[];
  isMaterialsLoading: boolean;
}

export default function MaterialComposition({
  variantIndex,
  materials,
  isMaterialsLoading
}: MaterialCompositionProps) {
  const { control, formState: { errors } } = useFormContext<CreateProductFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.materials` as const
  });
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState<boolean>(false);
  
  const handleAddMaterial = () => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      materialId: '',
      purity: '',
      weight: 0,
      rate: 0
    });
  };
  
  const handleDeleteMaterial = (materialIndex: number) => {
    if (fields.length <= 1) return;
    remove(materialIndex);
  };

  // Helper function to get material errors
  const getMaterialError = (materialIndex: number, field: string) => {
    const variantErrors = errors.variants?.[variantIndex];
    if (!variantErrors || !variantErrors.materials) return undefined;
    const materialErrors = variantErrors.materials[materialIndex];
    if (!materialErrors) return undefined;
    return (materialErrors as any)[field];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Material Composition</h3>
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={handleAddMaterial}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>
      
      {fields.map((material, materialIndex) => (
        <div key={material.id} className="border rounded-lg p-4 mb-4 bg-background">
        <div className="space-y-3 mb-3">
        <div className="space-y-1 w-full">
            <Label>Material</Label>
            <div className="relative">
                <Controller
                name={`variants.${variantIndex}.materials.${materialIndex}.materialId` as const}
                control={control}
                rules={{ required: "Material is required" }}
                render={({ field }) => (
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="outline" 
                            role="combobox" 
                            className={`w-full justify-between ${getMaterialError(materialIndex, 'materialId') ? 'border-destructive' : ''}`}
                        >
                        {field.value 
                            ? materials.find(m => m.id === field.value)?.name || "Select material..."
                            : "Select material..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                        <CommandInput placeholder="Search materials..." />
                        <CommandList>
                            <CommandEmpty>No materials found.</CommandEmpty>
                            <CommandGroup heading="Materials">
                            {materials.map((material) => (
                                <CommandItem
                                    key={material.id}
                                    value={material.id}
                                    onSelect={(value) => {
                                        field.onChange(value);
                                    }}
                                >
                                    {material.name} ({material.type})
                                </CommandItem>
                            ))}
                            </CommandGroup>
                            <CommandGroup>
                            <CommandItem
                                onSelect={() => setIsMaterialDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Material
                            </CommandItem>
                            </CommandGroup>
                        </CommandList>
                        </Command>
                    </PopoverContent>
                    </Popover>
                )}
                />
                <MaterialFormDialog
                    open={isMaterialDialogOpen}
                    onOpenChange={() => setIsMaterialDialogOpen(false)}
                />
            {getMaterialError(materialIndex, 'materialId') && (
                <span className="absolute -bottom-5 left-0 text-xs text-destructive">
                {getMaterialError(materialIndex, 'materialId')?.message}
                </span>
            )}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
            <Label>Purity</Label>
            <Controller
                name={`variants.${variantIndex}.materials.${materialIndex}.purity` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    className={getMaterialError(materialIndex, 'purity') ? 'border-destructive' : ''}
                    placeholder="e.g., 18K"
                />
                )}
            />
            {getMaterialError(materialIndex, 'purity') && (
                <span className="text-xs text-destructive mt-1">
                {getMaterialError(materialIndex, 'purity')?.message}
                </span>
            )}
            </div>
            <div className="space-y-1">
            <Label>Weight (g)</Label>
            <Controller
                name={`variants.${variantIndex}.materials.${materialIndex}.weight` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    type="number"
                    step="0.01"
                    className={getMaterialError(materialIndex, 'weight') ? 'border-destructive' : ''}
                    placeholder="0.00"
                    onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                    }}
                />
                )}
            />
            {getMaterialError(materialIndex, 'weight') && (
                <span className="text-xs text-destructive mt-1">
                {getMaterialError(materialIndex, 'weight')?.message}
                </span>
            )}
            </div>
            <div className="space-y-1">
            <Label>Rate ($/g)</Label>
            <Controller
                name={`variants.${variantIndex}.materials.${materialIndex}.rate` as const}
                control={control}
                render={({ field }) => (
                <Input
                    {...field}
                    type="number"
                    step="0.01"
                    className={getMaterialError(materialIndex, 'rate') ? 'border-destructive' : ''}
                    placeholder="0.00"
                    onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                    }}
                />
                )}
            />
            {getMaterialError(materialIndex, 'rate') && (
                <span className="text-xs text-destructive mt-1">
                {getMaterialError(materialIndex, 'rate')?.message}
                </span>
            )}
            </div>
        </div>
        </div>       
          <div className="flex justify-end">
            <Button 
              type="button"
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteMaterial(materialIndex)}
              disabled={fields.length <= 1}
            >
              Remove Material
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}