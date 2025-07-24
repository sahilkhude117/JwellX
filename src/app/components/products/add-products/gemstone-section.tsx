// src/components/products/add-product/forms/gemstone-section.tsx
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
import { Plus, Minus, Diamond } from 'lucide-react';
import { useGemstones } from '@/hooks/products/use-products';
import { createEmptyGemstone } from '@/lib/utils/products/product-form-utils';
import { SelectFieldSkeleton } from './create-product-skeleton';

interface GemstoneSectionProps {
  variantIndex: number;
}

// Common gemstone properties
const CUTS = ['Round', 'Princess', 'Emerald', 'Asscher', 'Marquise', 'Oval', 'Radiant', 'Pear', 'Heart'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

export const GemstoneSection: React.FC<GemstoneSectionProps> = ({ variantIndex }) => {
  const form = useFormContext();
  const { data: gemstonesData, isLoading: gemstonesLoading } = useGemstones();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `variants.${variantIndex}.gemstones`
  });

  const gemstones = gemstonesData?.gemstones || [];

  const handleAddGemstone = () => {
    append(createEmptyGemstone());
  };

  const handleRemoveGemstone = (index: number) => {
    remove(index);
  };

  // Auto-fill gemstone details when gemstone is selected
  const handleGemstoneSelect = (gemstoneId: string, gemstoneIndex: number) => {
    const selectedGemstone = gemstones.find(g => g.id === gemstoneId);
    if (selectedGemstone) {
      form.setValue(`variants.${variantIndex}.gemstones.${gemstoneIndex}.gemstoneId`, gemstoneId);
      form.setValue(`variants.${variantIndex}.gemstones.${gemstoneIndex}.gemstoneType`, selectedGemstone.name);
      form.setValue(`variants.${variantIndex}.gemstones.${gemstoneIndex}.rate`, selectedGemstone.defaultRate);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Diamond className="h-4 w-4" />
          <h4 className="font-medium">Gemstone Details</h4>
          <Badge variant="secondary" className="text-xs">
            {fields.length} {fields.length === 1 ? 'Gemstone' : 'Gemstones'}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddGemstone}
          type="button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Gemstone
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Diamond className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            No gemstones added to this variant
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Gemstones are optional. Add them if this variant contains precious stones.
          </p>
          <Button onClick={handleAddGemstone} variant="outline" size="sm" type="button">
            <Plus className="h-4 w-4 mr-2" />
            Add Gemstone
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, gemstoneIndex) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-muted/20">
              {/* Primary gemstone details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.gemstoneId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gemstone *</FormLabel>
                      {gemstonesLoading ? (
                        <SelectFieldSkeleton />
                      ) : (
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleGemstoneSelect(value, gemstoneIndex);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gemstone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gemstones.map((gemstone) => (
                              <SelectItem key={gemstone.id} value={gemstone.id}>
                                <div className="flex flex-col">
                                  <span>{gemstone.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {gemstone.shape} • ₹{gemstone.defaultRate}/{gemstone.unit}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="add-new">+ Add New Gemstone</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.caratWeight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carat Weight *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="e.g., 0.5" 
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
                  name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.rate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (₹/carat) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="Rate per carat" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional gemstone properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.cut`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cut</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not specified</SelectItem>
                          {CUTS.map((cut) => (
                            <SelectItem key={cut} value={cut}>
                              {cut}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.color`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not specified</SelectItem>
                          {COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.clarity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clarity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clarity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not specified</SelectItem>
                          {CLARITIES.map((clarity) => (
                            <SelectItem key={clarity} value={clarity}>
                              {clarity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.certificationId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., GIA123456" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Gemstone summary and remove button */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm">
                  <p className="text-muted-foreground">Gemstone Cost</p>
                  <p className="font-medium">
                    ₹{(
                      (form.watch(`variants.${variantIndex}.gemstones.${gemstoneIndex}.caratWeight`) || 0) * 
                      (form.watch(`variants.${variantIndex}.gemstones.${gemstoneIndex}.rate`) || 0)
                    ).toLocaleString('en-IN')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveGemstone(gemstoneIndex)}
                  className="border-destructive/30 text-destructive hover:bg-destructive/5"
                  type="button"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gemstone Summary */}
      {fields.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Gemstone Cost:</span>
            <span className="font-medium">
              ₹{fields.reduce((total, _, index) => {
                const caratWeight = form.watch(`variants.${variantIndex}.gemstones.${index}.caratWeight`) || 0;
                const rate = form.watch(`variants.${variantIndex}.gemstones.${index}.rate`) || 0;
                return total + (caratWeight * rate);
              }, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-muted-foreground">Total Carat Weight:</span>
            <span className="font-medium">
              {fields.reduce((total, _, index) => {
                const caratWeight = form.watch(`variants.${variantIndex}.gemstones.${index}.caratWeight`) || 0;
                return total + caratWeight;
              }, 0).toFixed(2)} ct
            </span>
          </div>
        </div>
      )}
    </div>
  );
};