'use client';
import React, { useState, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Table, TableBody, TableHead, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useMaterials, useGemstones } from '@/hooks/products/use-products';
import { CreateProductFormData, VariantFormData } from '@/lib/types/products/create-products';
import SizePresetsModal from './SizePresetsModal';
import VariantRow from './VariantRow';
import { Plus } from 'lucide-react';

// Helper function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export default function Variants() {
  const { control, watch, formState: { errors } } = useFormContext<CreateProductFormData>();
  const { fields: variants, append, remove, update } = useFieldArray({
    control,
    name: "variants" as const
  });
  
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [openPresets, setOpenPresets] = useState<'size' | null>(null);
  const productSku = watch('sku');
  const attributes = watch('attributes') || [];
  const hasGemstones = attributes.some(attr => attr.name === 'hasGemstones' && attr.value === 'true');
  
  const { data: materialsData, isLoading: isMaterialsLoading } = useMaterials();
  const { data: gemstonesData, isLoading: isGemstonesLoading } = useGemstones();
  
  const materials = materialsData?.materials || [];
  const gemstones = gemstonesData?.gemstones || [];

  // Auto-add first variant if none exist
  useEffect(() => {
    if (variants.length === 0) {
      handleAddVariant();
    }
  }, [variants.length]);

  // Auto-expand rows with errors
  useEffect(() => {
    if (errors.variants) {
      const errorVariantIds = variants
        .filter((_, index) => errors.variants?.[index])
        .map(variant => variant.id);
      
      setExpandedRows(prev => [...new Set([...prev, ...errorVariantIds])]);
    }
  }, [errors.variants, variants]);

  useEffect(() => {
    if (productSku && variants.length > 0) {
      variants.forEach((variant, index) => {
        const newSku = generateVariantSku(index + 1);
        if (!variant.sku || variant.sku !== newSku) {
          update(index, { ...variant, sku: newSku })
        }
      });
    }
  }, [productSku, variants, update]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const generateVariantSku = (index: number): string => {
    if (!productSku) return `VARIANT-${index}`;
    const base = productSku
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
    return `VAR-${base}-${index}`;
  };

  const handleAddVariant = () => {
    const newVariant: VariantFormData = {
      id: generateId(),
      sku: generateVariantSku(variants.length + 1),
      totalWeight: 0,
      makingCharge: 0,
      wastage: 0,
      quantity: 1,
      materials: [{
        id: generateId(),
        materialId: '',
        purity: '',
        weight: 0,
        rate: 0
      }],
      gemstones: []
    };
    append(newVariant);
  };

  const handleDeleteVariant = (index: number) => {
    if (variants.length <= 1) return; // Prevent deleting the last variant
    remove(index);
    setExpandedRows(prev => prev.filter(id => id !== variants[index].id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Variants</h2>
        <div className="flex gap-2">
          {/* <Button 
            type="button"
            variant="outline" 
            onClick={() => setOpenPresets('size')}
            disabled={!productSku}
            title={!productSku ? "Please enter product SKU first" : ""}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Size Variants
          </Button> */}
          <Button 
            type="button"
            variant="default" 
            onClick={handleAddVariant}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Variant
          </Button>
        </div>
      </div>
      
      <SizePresetsModal
        open={openPresets === 'size'}
        onOpenChange={() => setOpenPresets(null)}
        productSku={productSku}
        hasGemstones={hasGemstones}
      />
      
      {/* Variants Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>SKU</TableHead>
              <TableHead>Total Weight (g)</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>With Gemstones</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, variantIndex) => (
              <React.Fragment key={variant.id}>
                <VariantRow
                  variant={variant}
                  variantIndex={variantIndex}
                  isExpanded={expandedRows.includes(variant.id)}
                  toggleRow={toggleRow}
                  onDelete={handleDeleteVariant}
                  productSku={productSku}
                  hasGemstones={hasGemstones}
                  materials={materials}
                  gemstones={gemstones}
                  isMaterialsLoading={isMaterialsLoading}
                  isGemstonesLoading={isGemstonesLoading}
                />
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        {variants.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>No variants added yet. Click "Add Variant" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}