// src/components/products/add-product/forms/material-section.tsx
'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Gem } from 'lucide-react';
import { useMaterials } from '@/hooks/products/use-products';
import { createEmptyMaterial } from '@/lib/utils/products/product-form-utils';
import { SelectFieldSkeleton } from './create-product-skeleton';

interface MaterialSectionProps {
  variantIndex: number;
}

export const MaterialSection: React.FC<MaterialSectionProps> = ({ variantIndex }) => {
  const form = useFormContext();
  const { data: materialsData, isLoading: materialsLoading } = useMaterials();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `variants.${variantIndex}.materials`
  });

  const materials = materialsData?.materials || [];

  const handleAddMaterial = () => {
    append(createEmptyMaterial());
  };

  const handleRemoveMaterial = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Auto-fill material details when material is selected
  const handleMaterialSelect = (materialId: string, materialIndex: number) => {
    const selectedMaterial = materials.find(m => m.id === materialId);
    if (selectedMaterial) {
      form.setValue(`variants.${variantIndex}.materials.${materialIndex}.materialId`, materialId);
      form.setValue(`variants.${variantIndex}.materials.${materialIndex}.materialType`, selectedMaterial.name);
      form.setValue(`variants.${variantIndex}.materials.${materialIndex}.purity`, selectedMaterial.purity);
      form.setValue(`variants.${variantIndex}.materials.${materialIndex}.rate`, selectedMaterial.defaultRate);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gem className="h-4 w-4" />
          <h4 className="font-medium">Materials Composition</h4>
          <Badge variant="secondary" className="text-xs">
            {fields.length} {fields.length === 1 ? 'Material' : 'Materials'}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddMaterial}
          type="button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Gem className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            No materials added to this variant
          </p>
          <Button onClick={handleAddMaterial} variant="outline" size="sm" type="button">
            <Plus className="h-4 w-4 mr-2" />
            Add First Material
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, materialIndex) => (
            <div key={field.id} className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/20">
              <FormField
                control={form.control}
                name={`variants.${variantIndex}.materials.${materialIndex}.materialId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material *</FormLabel>
                    {materialsLoading ? (
                      <SelectFieldSkeleton />
                    ) : (
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleMaterialSelect(value, materialIndex);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              <div className="flex flex-col">
                                <span>{material.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {material.purity} • ₹{material.defaultRate}/{material.unit}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="add-new">+ Add New Material</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`variants.${variantIndex}.materials.${materialIndex}.purity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purity *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 22K, 18K" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`variants.${variantIndex}.materials.${materialIndex}.weight`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="Weight" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`variants.${variantIndex}.materials.${materialIndex}.rate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₹/g) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="Rate per gram" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end justify-between">
                <div className="text-sm">
                  <p className="text-muted-foreground">Cost</p>
                  <p className="font-medium">
                    ₹{(
                      (form.watch(`variants.${variantIndex}.materials.${materialIndex}.weight`) || 0) * 
                      (form.watch(`variants.${variantIndex}.materials.${materialIndex}.rate`) || 0)
                    ).toLocaleString('en-IN')}
                  </p>
                </div>
                {fields.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMaterial(materialIndex)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/5"
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Material Summary */}
      {fields.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Material Cost:</span>
            <span className="font-medium">
              ₹{fields.reduce((total, _, index) => {
                const weight = form.watch(`variants.${variantIndex}.materials.${index}.weight`) || 0;
                const rate = form.watch(`variants.${variantIndex}.materials.${index}.rate`) || 0;
                return total + (weight * rate);
              }, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};