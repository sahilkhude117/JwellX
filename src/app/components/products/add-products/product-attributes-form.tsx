// src/components/products/add-product/forms/product-attributes-form.tsx
'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, X, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createEmptyAttribute } from '@/lib/utils/products/product-form-utils';

// Common attribute names for jewelry
const ATTRIBUTE_NAMES = [
  'Style',
  'Occasion',
  'Collection', 
  'Gender',
  'Age Group',
  'Metal Color',
  'Stone Setting',
  'Closure Type',
  'Chain Length',
  'Ring Size',
  'Finish',
  'Theme',
  'Gift Type'
];

export const ProductAttributesForm: React.FC = () => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes"
  });

  const handleAddAttribute = () => {
    append(createEmptyAttribute());
  };

  const handleRemoveAttribute = (index: number) => {
    remove(index);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Tag className="h-5 w-5" />
            <div>
              <CardTitle>Product Attributes</CardTitle>
              <CardDescription>
                Define specific characteristics like Style, Occasion, Collection, etc. 
                These help in filtering and search functionality.
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">
            {fields.length} {fields.length === 1 ? 'Attribute' : 'Attributes'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No attributes added</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add attributes to help customers find and filter your products.
            </p>
            <Button onClick={handleAddAttribute} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Attribute
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`attributes.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attribute Name *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select attribute" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ATTRIBUTE_NAMES.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                              <SelectItem value="custom">+ Custom Attribute</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`attributes.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter attribute value" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveAttribute(index)}
                  className="border-destructive/30 text-destructive hover:bg-destructive/5"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={handleAddAttribute}
              className="w-full border-dashed"
              type="button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Attribute
            </Button>
          </div>
        )}

        {/* Quick Add Common Attributes */}
        {fields.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Quick Add Common Attributes:</h4>
            <div className="flex flex-wrap gap-2">
              {ATTRIBUTE_NAMES.filter(name => 
                !fields.some(field => form.getValues(`attributes.${fields.indexOf(field)}.name`) === name)
              ).slice(0, 6).map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    append({
                      id: `attr-${Date.now()}-${Math.random()}`,
                      name,
                      value: ''
                    });
                  }}
                  type="button"
                  className="text-xs"
                >
                  + {name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};