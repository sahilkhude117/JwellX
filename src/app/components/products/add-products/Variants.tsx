'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, useFieldArray, Controller, FieldError } from 'react-hook-form';
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Copy, 
  Trash2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useMaterials, useGemstones } from '@/hooks/products/use-products';
import MaterialFormDialog from '@/app/components/products/materials/material-form-dialog';
import GemstoneFormDialog from '../materials/gemstone-form-dialog';
import { CreateProductFormData, MaterialOption, GemstoneOption, VariantFormData, MaterialFormData, GemstoneFormData } from '@/lib/types/products/create-products';
import { Switch } from '@/components/ui/switch';

// Helper function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Helper functions for cost calculations
const calculateMaterialCost = (variant: VariantFormData): number => {
  return variant.materials.reduce((sum: number, material: MaterialFormData) => {
    return sum + (material.weight * material.rate);
  }, 0);
};

const calculateGemstoneCost = (variant: VariantFormData): number => {
  return variant.gemstones.reduce((sum: number, gemstone: GemstoneFormData) => {
    return sum + (gemstone.caratWeight * gemstone.rate);
  }, 0);
};

const calculateTotalCost = (variant: VariantFormData): number => {
  const materialCost = calculateMaterialCost(variant);
  const gemstoneCost = calculateGemstoneCost(variant);
  const makingCharge = variant.makingCharge || 0;
  
  return materialCost + gemstoneCost + makingCharge;
};

export default function Variants() {
  const { control, watch, formState: { errors } } = useFormContext<CreateProductFormData>();
  const { fields: variants, append, remove, update } = useFieldArray({
    control,
    name: "variants" as const
  });
  
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [openPresets, setOpenPresets] = useState<'size' | 'gemstone' | null>(null);
  const [sizeRange, setSizeRange] = useState('5, 6, 7, 8');
  const [applyGemstones, setApplyGemstones] = useState(true);
  const [gemstoneSpecs, setGemstoneSpecs] = useState({
    gemstoneId: '',
    caratWeight: 1.0,
    color: '',
    clarity: '',
    cut: '',
    certificationId: '',
    rate: 5000
  });
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [isGemstoneDialogOpen, setIsGemstoneDialogOpen] = useState(false);
  
  const productName = watch('name');
  const attributes = watch('attributes') || [];
  const hasGemstones = attributes.some(attr => attr.name === 'hasGemstones' && attr.value === 'true');
  
  const { 
    data: materialsData,
    isLoading: isMaterialsLoading,
    error: materialsError
  } = useMaterials();
  
  const { 
    data: gemstonesData,
    isLoading: isGemstonesLoading,
    error: gemstonesError
  } = useGemstones();
  
  const materials: MaterialOption[] = materialsData?.materials || [];
  const gemstones: GemstoneOption[] = gemstonesData?.gemstones || [];
  
  useEffect(() => {
    // Auto-add first variant if none exist
    if (variants.length === 0) {
      handleAddVariant();
    }
  }, [variants.length]);
  
  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };
  
  const generateVariantSku = (index: number): string => {
    if (!productName) return `VARIANT-${index}`;
    
    const base = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
    
    return `${base}-V${index}`;
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
  
  const handleUpdateVariant = (index: number, field: keyof VariantFormData, value: any) => {
    const updatedVariant = { ...variants[index], [field]: value };
    
    // If updating totalWeight, auto-generate SKU
    if (field === 'totalWeight' && variants[index].sku.startsWith(productName?.toUpperCase() || '')) {
      updatedVariant.sku = generateVariantSku(index + 1);
    }
    
    update(index, updatedVariant);
  };
  
  const handleDeleteVariant = (index: number) => {
    if (variants.length <= 1) return; // Prevent deleting the last variant
    
    remove(index);
    setExpandedRows(prev => prev.filter(id => id !== variants[index].id));
  };
  
  const handleAddMaterial = (variantIndex: number) => {
    const variant = variants[variantIndex];
    const updatedMaterials = [
      ...variant.materials,
      {
        id: generateId(),
        materialId: '',
        purity: '',
        weight: 0,
        rate: 0
      }
    ];
    
    update(variantIndex, { ...variant, materials: updatedMaterials });
  };
  
  const handleUpdateMaterial = (
    variantIndex: number, 
    materialIndex: number, 
    field: keyof MaterialFormData, 
    value: any
  ) => {
    const variant = variants[variantIndex];
    const updatedMaterials = [...variant.materials];
    updatedMaterials[materialIndex] = { ...updatedMaterials[materialIndex], [field]: value };
    
    // If materialId changes, reset purity options
    if (field === 'materialId' && value) {
      const selectedMaterial = materials.find(m => m.id === value);
      if (selectedMaterial) {
        updatedMaterials[materialIndex] = {
          ...updatedMaterials[materialIndex],
          materialId: value,
          purity: selectedMaterial.purity || '',
          rate: selectedMaterial.defaultRate || 0
        };
      }
    }
    
    update(variantIndex, { ...variant, materials: updatedMaterials });
  };
  
  const handleDeleteMaterial = (variantIndex: number, materialIndex: number) => {
    const variant = variants[variantIndex];
    const updatedMaterials = variant.materials.filter((_, idx) => idx !== materialIndex);
    
    // Ensure at least one material exists
    if (updatedMaterials.length === 0) {
      updatedMaterials.push({
        id: generateId(),
        materialId: '',
        purity: '',
        weight: 0,
        rate: 0
      });
    }
    
    update(variantIndex, { ...variant, materials: updatedMaterials });
  };
  
  const handleAddGemstone = (variantIndex: number) => {
    const variant = variants[variantIndex];
    const updatedGemstones = [
      ...variant.gemstones,
      {
        id: generateId(),
        gemstoneId: '',
        caratWeight: 0.5,
        cut: '',
        color: '',
        clarity: '',
        certificationId: '',
        rate: 2500
      }
    ];
    
    update(variantIndex, { ...variant, gemstones: updatedGemstones });
  };
  
  const handleUpdateGemstone = (
    variantIndex: number, 
    gemstoneIndex: number, 
    field: keyof GemstoneFormData, 
    value: any
  ) => {
    const variant = variants[variantIndex];
    const updatedGemstones = [...variant.gemstones];
    updatedGemstones[gemstoneIndex] = { ...updatedGemstones[gemstoneIndex], [field]: value };
    
    // If gemstoneId changes, update default values
    if (field === 'gemstoneId' && value) {
      const selectedGemstone = gemstones.find(g => g.id === value);
      if (selectedGemstone) {
        updatedGemstones[gemstoneIndex] = {
          ...updatedGemstones[gemstoneIndex],
          gemstoneId: value,
          rate: selectedGemstone.defaultRate || 0
        };
      }
    }
    
    update(variantIndex, { ...variant, gemstones: updatedGemstones });
  };
  
  const handleDeleteGemstone = (variantIndex: number, gemstoneIndex: number) => {
    const variant = variants[variantIndex];
    const updatedGemstones = variant.gemstones.filter((_, idx) => idx !== gemstoneIndex);
    
    update(variantIndex, { ...variant, gemstones: updatedGemstones });
  };
  
  const handleCreateSizeVariants = () => {
    const sizes = sizeRange.split(',').map(s => s.trim()).filter(s => s);
    const newVariants: VariantFormData[] = sizes.map((size, index) => ({
      id: generateId(),
      sku: `${productName ? productName.substring(0, 20).replace(/[^A-Z0-9]/g, '-') : 'VARIANT'}-SIZE-${size}`,
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
      gemstones: applyGemstones && hasGemstones ? [{
        id: generateId(),
        gemstoneId: gemstoneSpecs.gemstoneId,
        caratWeight: gemstoneSpecs.caratWeight,
        cut: gemstoneSpecs.cut,
        color: gemstoneSpecs.color,
        clarity: gemstoneSpecs.clarity,
        certificationId: gemstoneSpecs.certificationId,
        rate: gemstoneSpecs.rate
      }] : []
    }));
    
    newVariants.forEach(variant => append(variant));
    setOpenPresets(null);
  };
  
  // Helper functions to get field errors with proper typing
  const getMaterialError = (variantIndex: number, materialIndex: number, field: string): FieldError | undefined => {
    const variantErrors = errors.variants?.[variantIndex];
    if (!variantErrors || !variantErrors.materials) return undefined;
    
    const materialErrors = variantErrors.materials[materialIndex];
    if (!materialErrors) return undefined;
    
    return (materialErrors as any)[field] as FieldError | undefined;
  };
  
  const getGemstoneError = (variantIndex: number, gemstoneIndex: number, field: string): FieldError | undefined => {
    const variantErrors = errors.variants?.[variantIndex];
    if (!variantErrors || !variantErrors.gemstones) return undefined;
    
    const gemstoneErrors = variantErrors.gemstones[gemstoneIndex];
    if (!gemstoneErrors) return undefined;
    
    return (gemstoneErrors as any)[field] as FieldError | undefined;
  };
  
  const getVariantError = (variantIndex: number, field: string): FieldError | undefined => {
    const variantErrors = errors.variants?.[variantIndex];
    if (!variantErrors) return undefined;
    
    return (variantErrors as any)[field] as FieldError | undefined;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Variants</h2>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setOpenPresets('size')}
            disabled={!productName}
            title={!productName ? "Please enter product name first" : ""}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Size Variants
          </Button>
          <Button 
            type="button"
            variant="default" 
            onClick={handleAddVariant}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Variant
          </Button>
        </div>
      </div>
      
      {/* Size Presets Modal */}
      <Dialog open={openPresets === 'size'} onOpenChange={() => setOpenPresets(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Size Variants</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="size-range">Size Range</Label>
              <Input
                id="size-range"
                value={sizeRange}
                onChange={e => setSizeRange(e.target.value)}
                placeholder="e.g., 5, 6, 7, 8"
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated sizes (e.g., 5, 6, 7, 8)
              </p>
            </div>
            {hasGemstones && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="apply-gemstones" 
                    checked={applyGemstones} 
                    onCheckedChange={setApplyGemstones} 
                  />
                  <Label htmlFor="apply-gemstones" className="font-normal">
                    Apply same gemstone specs to all sizes
                  </Label>
                </div>
                {applyGemstones && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>Gemstone</Label>
                      <div className="relative">
                        <Select
                          value={gemstoneSpecs.gemstoneId}
                          onValueChange={(value) => {
                            const selectedGemstone = gemstones.find(g => g.id === value);
                            setGemstoneSpecs(prev => ({
                              ...prev,
                              gemstoneId: value,
                              rate: selectedGemstone?.defaultRate || 5000
                            }));
                          }}
                        >
                          <SelectTrigger 
                            className={gemstonesError ? 'border-destructive' : ''}
                            disabled={isGemstonesLoading}
                          >
                            <SelectValue placeholder="Select gemstone" />
                          </SelectTrigger>
                          <SelectContent>
                            {isGemstonesLoading ? (
                              <div className="p-2 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading gemstones...
                              </div>
                            ) : gemstonesError ? (
                              <div className="p-2 text-center text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                                Error loading gemstones
                              </div>
                            ) : gemstones.length === 0 ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                No gemstones found
                                <Button
                                  type="button"
                                  variant="link"
                                  className="p-0 h-auto font-normal block mt-1"
                                  onClick={() => setIsGemstoneDialogOpen(true)}
                                >
                                  Add New Gemstone
                                </Button>
                              </div>
                            ) : (
                              <>
                                {gemstones.map((gemstone) => (
                                  <SelectItem key={gemstone.id} value={gemstone.id}>
                                    {gemstone.name} ({gemstone.shape})
                                  </SelectItem>
                                ))}
                                <div className="border-t pt-2 mt-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => setIsGemstoneDialogOpen(true)}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Gemstone
                                  </Button>
                                </div>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Carat Weight</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={gemstoneSpecs.caratWeight}
                        onChange={e => setGemstoneSpecs(prev => ({ 
                          ...prev, 
                          caratWeight: parseFloat(e.target.value) || 0 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input
                        value={gemstoneSpecs.color}
                        onChange={e => setGemstoneSpecs(prev => ({ ...prev, color: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Clarity</Label>
                      <Input
                        value={gemstoneSpecs.clarity}
                        onChange={e => setGemstoneSpecs(prev => ({ ...prev, clarity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Rate per Carat ($)</Label>
                      <Input
                        type="number"
                        value={gemstoneSpecs.rate}
                        onChange={e => setGemstoneSpecs(prev => ({ 
                          ...prev, 
                          rate: parseFloat(e.target.value) || 0 
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button 
                type="button"
                onClick={handleCreateSizeVariants}
                disabled={sizeRange.trim() === ''}
              >
                Create {sizeRange.split(',').filter(s => s.trim()).length} Variants
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Material Form Dialog */}
      <MaterialFormDialog
        open={isMaterialDialogOpen}
        onOpenChange={setIsMaterialDialogOpen}
      />
      
      {/* Gemstone Form Dialog */}
      <GemstoneFormDialog
        open={isGemstoneDialogOpen}
        onOpenChange={setIsGemstoneDialogOpen}
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
                <TableRow>
                  <TableCell>
                    <Controller
                      name={`variants.${variantIndex}.sku` as const}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          className={getVariantError(variantIndex, 'sku') ? 'border-destructive' : ''}
                          placeholder="Enter SKU"
                          onChange={(e) => {
                            field.onChange(e);
                            handleUpdateVariant(variantIndex, 'sku', e.target.value);
                          }}
                        />
                      )}
                    />
                    {getVariantError(variantIndex, 'sku') && (
                      <span className="text-xs text-destructive">
                        {getVariantError(variantIndex, 'sku')?.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Controller
                        name={`variants.${variantIndex}.totalWeight` as const}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            className={getVariantError(variantIndex, 'totalWeight') ? 'border-destructive' : ''}
                            placeholder="0.00"
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              field.onChange(value);
                              handleUpdateVariant(variantIndex, 'totalWeight', value);
                            }}
                          />
                        )}
                      />
                      <Badge variant="outline" className="text-xs">g</Badge>
                    </div>
                    {getVariantError(variantIndex, 'totalWeight') && (
                      <span className="text-xs text-destructive">
                        {getVariantError(variantIndex, 'totalWeight')?.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`variants.${variantIndex}.quantity` as const}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          className={getVariantError(variantIndex, 'quantity') ? 'border-destructive' : ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            field.onChange(value);
                            handleUpdateVariant(variantIndex, 'quantity', value);
                          }}
                        />
                      )}
                    />
                    {getVariantError(variantIndex, 'quantity') && (
                      <span className="text-xs text-destructive">
                        {getVariantError(variantIndex, 'quantity')?.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={variant.materials.length > 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {variant.materials.length} {variant.materials.length === 1 ? 'material' : 'materials'}
                    </Badge>
                    {getVariantError(variantIndex, 'materials') && (
                      <span className="block text-xs text-destructive mt-1">
                        {getVariantError(variantIndex, 'materials')?.message}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={variant.gemstones.length > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {variant.gemstones.length} {variant.gemstones.length === 1 ? 'gemstone' : 'gemstones'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleRow(variant.id)}
                        aria-label={expandedRows.includes(variant.id) ? "Collapse details" : "Expand details"}
                      >
                        {expandedRows.includes(variant.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newVariant: VariantFormData = { 
                            ...variant, 
                            id: generateId(),
                            sku: generateVariantSku(variants.length + 1)
                          };
                          append(newVariant);
                        }}
                        aria-label="Copy variant"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteVariant(variantIndex)}
                        aria-label="Delete variant"
                        disabled={variants.length <= 1}
                        title={variants.length <= 1 ? "At least one variant is required" : ""}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {/* Expandable Details */}
                {expandedRows.includes(variant.id) && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <div className="p-4 bg-muted/30">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Material Composition */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="font-semibold">Material Composition</h3>
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddMaterial(variantIndex)}
                              >
                                <Plus className="mr-2 h-4 w-4" /> Add Material
                              </Button>
                            </div>
                            {variant.materials.map((material, materialIndex) => (
                              <div key={material.id} className="border rounded-lg p-4 mb-4 bg-background">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                  <div className="space-y-1">
                                    <Label>Material</Label>
                                    <div className="relative">
                                      <Controller
                                        name={`variants.${variantIndex}.materials.${materialIndex}.materialId` as const}
                                        control={control}
                                        rules={{ required: "Material is required" }}
                                        render={({ field }) => (
                                          <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                              field.onChange(value);
                                              handleUpdateMaterial(variantIndex, materialIndex, 'materialId', value);
                                            }}
                                          >
                                            <SelectTrigger 
                                              className={getMaterialError(variantIndex, materialIndex, 'materialId') ? 'border-destructive' : ''}
                                              disabled={isMaterialsLoading}
                                            >
                                              <SelectValue placeholder="Select material" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {isMaterialsLoading ? (
                                                <div className="p-2 flex items-center justify-center">
                                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                  Loading materials...
                                                </div>
                                              ) : materialsError ? (
                                                <div className="p-2 text-center text-sm text-destructive">
                                                  <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                                                  Error loading materials
                                                </div>
                                              ) : materials.length === 0 ? (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                  No materials found
                                                  <Button
                                                    type="button"
                                                    variant="link"
                                                    className="p-0 h-auto font-normal block mt-1"
                                                    onClick={() => setIsMaterialDialogOpen(true)}
                                                  >
                                                    Add New Material
                                                  </Button>
                                                </div>
                                              ) : (
                                                <>
                                                  {materials.map((materialOption) => (
                                                    <SelectItem 
                                                      key={materialOption.id} 
                                                      value={materialOption.id}
                                                    >
                                                      {materialOption.name} ({materialOption.type})
                                                    </SelectItem>
                                                  ))}
                                                  <div className="border-t pt-2 mt-2">
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      className="w-full justify-start"
                                                      onClick={() => setIsMaterialDialogOpen(true)}
                                                    >
                                                      <Plus className="mr-2 h-4 w-4" />
                                                      Add New Material
                                                    </Button>
                                                  </div>
                                                </>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        )}
                                      />
                                      {getMaterialError(variantIndex, materialIndex, 'materialId') && (
                                        <span className="absolute -bottom-5 left-0 text-xs text-destructive">
                                          {getMaterialError(variantIndex, materialIndex, 'materialId')?.message}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Purity</Label>
                                    <Controller
                                      name={`variants.${variantIndex}.materials.${materialIndex}.purity` as const}
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          className={getMaterialError(variantIndex, materialIndex, 'purity') ? 'border-destructive' : ''}
                                          placeholder="e.g., 18K"
                                          onChange={(e) => {
                                            field.onChange(e.target.value);
                                            handleUpdateMaterial(variantIndex, materialIndex, 'purity', e.target.value);
                                          }}
                                        />
                                      )}
                                    />
                                    {getMaterialError(variantIndex, materialIndex, 'purity') && (
                                      <span className="text-xs text-destructive mt-1">
                                        {getMaterialError(variantIndex, materialIndex, 'purity')?.message}
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
                                          className={getMaterialError(variantIndex, materialIndex, 'weight') ? 'border-destructive' : ''}
                                          placeholder="0.00"
                                          onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            field.onChange(value);
                                            handleUpdateMaterial(variantIndex, materialIndex, 'weight', value);
                                          }}
                                        />
                                      )}
                                    />
                                    {getMaterialError(variantIndex, materialIndex, 'weight') && (
                                      <span className="text-xs text-destructive mt-1">
                                        {getMaterialError(variantIndex, materialIndex, 'weight')?.message}
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
                                          className={getMaterialError(variantIndex, materialIndex, 'rate') ? 'border-destructive' : ''}
                                          placeholder="0.00"
                                          onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            field.onChange(value);
                                            handleUpdateMaterial(variantIndex, materialIndex, 'rate', value);
                                          }}
                                        />
                                      )}
                                    />
                                    {getMaterialError(variantIndex, materialIndex, 'rate') && (
                                      <span className="text-xs text-destructive mt-1">
                                        {getMaterialError(variantIndex, materialIndex, 'rate')?.message}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Button 
                                    type="button"
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteMaterial(variantIndex, materialIndex)}
                                    disabled={variant.materials.length <= 1}
                                  >
                                    Remove Material
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Gemstone Details */}
                          {hasGemstones && (
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold">Gemstone Details</h3>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAddGemstone(variantIndex)}
                                >
                                  <Plus className="mr-2 h-4 w-4" /> Add Gemstone
                                </Button>
                              </div>
                              {variant.gemstones.map((gemstone, gemstoneIndex) => (
                                <div key={gemstone.id} className="border rounded-lg p-4 mb-4 bg-background">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                    <div className="space-y-1">
                                      <Label>Gemstone</Label>
                                      <div className="relative">
                                        <Controller
                                          name={`variants.${variantIndex}.gemstones.${gemstoneIndex}.gemstoneId` as const}
                                          control={control}
                                          render={({ field }) => (
                                            <Select
                                              value={field.value}
                                              onValueChange={(value) => {
                                                field.onChange(value);
                                                handleUpdateGemstone(variantIndex, gemstoneIndex, 'gemstoneId', value);
                                              }}
                                            >
                                              <SelectTrigger 
                                                className={getGemstoneError(variantIndex, gemstoneIndex, 'gemstoneId') ? 'border-destructive' : ''}
                                                disabled={isGemstonesLoading}
                                              >
                                                <SelectValue placeholder="Select gemstone" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {isGemstonesLoading ? (
                                                  <div className="p-2 flex items-center justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Loading gemstones...
                                                  </div>
                                                ) : gemstonesError ? (
                                                  <div className="p-2 text-center text-sm text-destructive">
                                                    <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                                                    Error loading gemstones
                                                  </div>
                                                ) : gemstones.length === 0 ? (
                                                  <div className="p-2 text-center text-sm text-muted-foreground">
                                                    No gemstones found
                                                    <Button
                                                      type="button"
                                                      variant="link"
                                                      className="p-0 h-auto font-normal block mt-1"
                                                      onClick={() => setIsGemstoneDialogOpen(true)}
                                                    >
                                                      Add New Gemstone
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <>
                                                    {gemstones.map((gemstoneOption) => (
                                                      <SelectItem 
                                                        key={gemstoneOption.id} 
                                                        value={gemstoneOption.id}
                                                      >
                                                        {gemstoneOption.name} ({gemstoneOption.shape})
                                                      </SelectItem>
                                                    ))}
                                                    <div className="border-t pt-2 mt-2">
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="w-full justify-start"
                                                        onClick={() => setIsGemstoneDialogOpen(true)}
                                                      >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add New Gemstone
                                                      </Button>
                                                    </div>
                                                  </>
                                                )}
                                              </SelectContent>
                                            </Select>
                                          )}
                                        />
                                      </div>
                                    </div>
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
                                            className={getGemstoneError(variantIndex, gemstoneIndex, 'caratWeight') ? 'border-destructive' : ''}
                                            placeholder="0.0"
                                            onChange={(e) => {
                                              const value = parseFloat(e.target.value) || 0;
                                              field.onChange(value);
                                              handleUpdateGemstone(variantIndex, gemstoneIndex, 'caratWeight', value);
                                            }}
                                          />
                                        )}
                                      />
                                      {getGemstoneError(variantIndex, gemstoneIndex, 'caratWeight') && (
                                        <span className="text-xs text-destructive mt-1">
                                          {getGemstoneError(variantIndex, gemstoneIndex, 'caratWeight')?.message}
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
                                            onChange={(e) => {
                                              field.onChange(e.target.value);
                                              handleUpdateGemstone(variantIndex, gemstoneIndex, 'color', e.target.value);
                                            }}
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
                                            onChange={(e) => {
                                              field.onChange(e.target.value);
                                              handleUpdateGemstone(variantIndex, gemstoneIndex, 'clarity', e.target.value);
                                            }}
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
                                            className={getGemstoneError(variantIndex, gemstoneIndex, 'rate') ? 'border-destructive' : ''}
                                            placeholder="0.00"
                                            onChange={(e) => {
                                              const value = parseFloat(e.target.value) || 0;
                                              field.onChange(value);
                                              handleUpdateGemstone(variantIndex, gemstoneIndex, 'rate', value);
                                            }}
                                          />
                                        )}
                                      />
                                      {getGemstoneError(variantIndex, gemstoneIndex, 'rate') && (
                                        <span className="text-xs text-destructive mt-1">
                                          {getGemstoneError(variantIndex, gemstoneIndex, 'rate')?.message}
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
                                            onChange={(e) => {
                                              field.onChange(e.target.value);
                                              handleUpdateGemstone(variantIndex, gemstoneIndex, 'cut', e.target.value);
                                            }}
                                          />
                                        )}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button 
                                      type="button"
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleDeleteGemstone(variantIndex, gemstoneIndex)}
                                    >
                                      Remove Gemstone
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Pricing Section */}
                          <div className="lg:col-span-2">
                            <h3 className="font-semibold mb-3">Pricing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <Label>Making Charge ($)</Label>
                                <Controller
                                  name={`variants.${variantIndex}.makingCharge` as const}
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      className={getVariantError(variantIndex, 'makingCharge') ? 'border-destructive' : ''}
                                      placeholder="0.00"
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        field.onChange(value);
                                        handleUpdateVariant(variantIndex, 'makingCharge', value);
                                      }}
                                    />
                                  )}
                                />
                                {getVariantError(variantIndex, 'makingCharge') && (
                                  <span className="text-xs text-destructive mt-1">
                                    {getVariantError(variantIndex, 'makingCharge')?.message}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label>Wastage (%)</Label>
                                <Controller
                                  name={`variants.${variantIndex}.wastage` as const}
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.1"
                                      placeholder="0.0"
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        field.onChange(value);
                                        handleUpdateVariant(variantIndex, 'wastage', value);
                                      }}
                                    />
                                  )}
                                />
                                {Number(variant.wastage) > 15 && (
                                  <div className="flex items-center text-destructive text-xs mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    High wastage
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label>Total Material Cost</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                                  ${calculateMaterialCost(variant).toFixed(2)}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Total Gemstone Cost</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                                  ${calculateGemstoneCost(variant).toFixed(2)}
                                </div>
                              </div>
                              <div className="space-y-1 col-span-2">
                                <Label>Total Cost</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted font-medium">
                                  ${calculateTotalCost(variant).toFixed(2)}
                                </div>
                              </div>
                              <div className="space-y-1 col-span-2">
                                <Label>Retail Price ($)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Enter retail price"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        {variants.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>No variants added yet. Click "Add Variant" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}