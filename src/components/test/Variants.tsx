// components/add-product/Variants.tsx
'use client';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Plus, Copy, Trash2, AlertCircle } from 'lucide-react';
import React from 'react';
import { Switch } from '../ui/switch';

// Jewelry-specific data
const PURITY_OPTIONS = {
  'Gold': ['14K', '18K', '22K', '24K'],
  'Platinum': ['950', '900', '850'],
  'Silver': ['925', '900', '800'],
} as const;

const GEMSTONE_TYPES = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Pearl'] as const;
const DIAMOND_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J'] as const;
const DIAMOND_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'] as const;

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Variants({
  variants,
  hasGemstones,
  onUpdate,
}: {
  variants: any[];
  hasGemstones: boolean;
  onUpdate: (variants: any[]) => void;
}) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [openPresets, setOpenPresets] = useState<'size' | 'gemstone' | null>(null);
  const [sizeRange, setSizeRange] = useState('5, 6, 7, 8');
  const [applyGemstones, setApplyGemstones] = useState(true);
  const [gemstoneSpecs, setGemstoneSpecs] = useState({
    type: 'Diamond',
    caratWeight: '1.0',
    color: 'D',
    clarity: 'VS1',
    rate: '5000',
  });

  useEffect(() => {
    // Auto-add first variant if none exist
    if (variants.length === 0) {
      handleAddVariant();
    }
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleAddVariant = () => {
    const newVariant = {
      id: generateId(),
      size: '',
      grossWeight: '',
      quantity: '1',
      makingCharge: '',
      wastage: '',
      materials: [{
        id: generateId(),
        material: 'Gold',
        purity: '18K',
        weight: '',
        rate: '',
      }],
      gemstones: hasGemstones ? [{
        id: generateId(),
        type: 'Diamond',
        caratWeight: '1.0',
        rate: '5000',
        cut: 'Excellent',
        color: 'D',
        clarity: 'VS1',
      }] : [],
      status: 'in-stock' as const,
    };
    onUpdate([...variants, newVariant]);
  };

  const handleUpdateVariant = (id: string, updates: Partial<any>) => {
    onUpdate(variants.map(v => 
      v.id === id ? { ...v, ...updates } : v
    ));
  };

  const handleDeleteVariant = (id: string) => {
    onUpdate(variants.filter(v => v.id !== id));
  };

  const handleAddMaterial = (variantId: string) => {
    handleUpdateVariant(variantId, {
      materials: [
        ...variants.find(v => v.id === variantId)!.materials,
        { id: generateId(), material: 'Gold', purity: '18K', weight: '', rate: '' }
      ]
    });
  };

  const handleUpdateMaterial = (variantId: string, materialId: string, updates: Partial<any>) => {
    const variant = variants.find(v => v.id === variantId)!;
    handleUpdateVariant(variantId, {
      materials: variant.materials.map(m => 
        m.id === materialId ? { ...m, ...updates } : m
      )
    });
  };

  const handleDeleteMaterial = (variantId: string, materialId: string) => {
    const variant = variants.find(v => v.id === variantId)!;
    handleUpdateVariant(variantId, {
      materials: variant.materials.filter(m => m.id !== materialId)
    });
  };

  const handleAddGemstone = (variantId: string) => {
    handleUpdateVariant(variantId, {
      gemstones: [
        ...variants.find(v => v.id === variantId)!.gemstones,
        { 
          id: generateId(), 
          type: 'Diamond', 
          caratWeight: '0.5', 
          rate: '2500',
          cut: 'Very Good',
          color: 'E',
          clarity: 'VS2'
        }
      ]
    });
  };

  const handleUpdateGemstone = (variantId: string, gemstoneId: string, updates: Partial<any>) => {
    const variant = variants.find(v => v.id === variantId)!;
    handleUpdateVariant(variantId, {
      gemstones: variant.gemstones.map(g => 
        g.id === gemstoneId ? { ...g, ...updates } : g
      )
    });
  };

  const handleDeleteGemstone = (variantId: string, gemstoneId: string) => {
    const variant = variants.find(v => v.id === variantId)!;
    handleUpdateVariant(variantId, {
      gemstones: variant.gemstones.filter(g => g.id !== gemstoneId)
    });
  };

  const handleCreateSizeVariants = () => {
    const sizes = sizeRange.split(',').map(s => s.trim());
    const newVariants = sizes.map(size => ({
      id: generateId(),
      size,
      grossWeight: '',
      quantity: '1',
      makingCharge: '',
      wastage: '',
      materials: [{
        id: generateId(),
        material: 'Gold',
        purity: '18K',
        weight: '',
        rate: '',
      }],
      gemstones: applyGemstones && hasGemstones ? [{
        id: generateId(),
        ...gemstoneSpecs,
        caratWeight: gemstoneSpecs.caratWeight,
        rate: gemstoneSpecs.rate,
      }] : [],
      status: 'in-stock',
    }));
    onUpdate([...variants, ...newVariants]);
    setOpenPresets(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Variants</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpenPresets('size')}
            disabled={!hasGemstones}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Size Variants
          </Button>
          <Button 
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
                      <Label>Gemstone Type</Label>
                      <Select
                        value={gemstoneSpecs.type}
                        onValueChange={value => setGemstoneSpecs(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gemstone" />
                        </SelectTrigger>
                        <SelectContent>
                          {GEMSTONE_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Carat Weight</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={gemstoneSpecs.caratWeight}
                        onChange={e => setGemstoneSpecs(prev => ({ ...prev, caratWeight: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select
                        value={gemstoneSpecs.color}
                        onValueChange={value => setGemstoneSpecs(prev => ({ ...prev, color: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAMOND_COLORS.map(color => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Clarity</Label>
                      <Select
                        value={gemstoneSpecs.clarity}
                        onValueChange={value => setGemstoneSpecs(prev => ({ ...prev, clarity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Clarity" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAMOND_CLARITIES.map(clarity => (
                            <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Rate per Carat ($)</Label>
                      <Input
                        type="number"
                        value={gemstoneSpecs.rate}
                        onChange={e => setGemstoneSpecs(prev => ({ ...prev, rate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button 
              className="w-full mt-4" 
              onClick={handleCreateSizeVariants}
            >
              Create {sizeRange.split(',').length} Variants
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variants Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Variant ID</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Gross Weight (g)</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <React.Fragment key={variant.id}>
                <TableRow>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {variant.id.substring(0, 6)}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.size}
                      onChange={e => handleUpdateVariant(variant.id, { size: e.target.value })}
                      className="w-20"
                      placeholder="e.g., 6"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.grossWeight}
                        onChange={e => handleUpdateVariant(variant.id, { grossWeight: e.target.value })}
                        className="w-24"
                        placeholder="0.00"
                      />
                      <Badge variant="outline" className="text-xs">g</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={variant.quantity}
                      onChange={e => handleUpdateVariant(variant.id, { quantity: e.target.value })}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        variant.quantity > 5 ? "default" :
                        variant.quantity > 0 ? "warning" : "destructive"
                      }
                    >
                      {variant.quantity > 5 ? "In Stock" : 
                       variant.quantity > 0 ? "Low Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
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
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newVariant = { ...variant, id: generateId() };
                          onUpdate([...variants, newVariant]);
                        }}
                        aria-label="Copy variant"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteVariant(variant.id)}
                        aria-label="Delete variant"
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
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddMaterial(variant.id)}
                              >
                                <Plus className="mr-2 h-4 w-4" /> Add Material
                              </Button>
                            </div>
                            
                            {variant.materials.map((material: any) => (
                              <div key={material.id} className="border rounded-lg p-4 mb-4 bg-background">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                  <div className="space-y-1">
                                    <Label>Material</Label>
                                    <Select
                                      value={material.material}
                                      onValueChange={value => handleUpdateMaterial(variant.id, material.id, { material: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select material" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.keys(PURITY_OPTIONS).map(mat => (
                                          <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Purity</Label>
                                    <Select
                                      value={material.purity}
                                      onValueChange={value => handleUpdateMaterial(variant.id, material.id, { purity: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select purity" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {material.material && PURITY_OPTIONS[material.material as keyof typeof PURITY_OPTIONS]?.map(purity => (
                                          <SelectItem key={purity} value={purity}>{purity}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Weight (g)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={material.weight}
                                      onChange={e => handleUpdateMaterial(variant.id, material.id, { weight: e.target.value })}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Rate ($/g)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={material.rate}
                                      onChange={e => handleUpdateMaterial(variant.id, material.id, { rate: e.target.value })}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex justify-end">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteMaterial(variant.id, material.id)}
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
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAddGemstone(variant.id)}
                                >
                                  <Plus className="mr-2 h-4 w-4" /> Add Gemstone
                                </Button>
                              </div>
                              
                              {variant.gemstones.map((gemstone: any) => (
                                <div key={gemstone.id} className="border rounded-lg p-4 mb-4 bg-background">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                    <div className="space-y-1">
                                      <Label>Type</Label>
                                      <Select
                                        value={gemstone.type}
                                        onValueChange={value => handleUpdateGemstone(variant.id, gemstone.id, { type: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select gemstone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {GEMSTONE_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label>Carat Weight</Label>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        value={gemstone.caratWeight}
                                        onChange={e => handleUpdateGemstone(variant.id, gemstone.id, { caratWeight: e.target.value })}
                                        placeholder="0.0"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label>Color</Label>
                                      <Select
                                        value={gemstone.color}
                                        onValueChange={value => handleUpdateGemstone(variant.id, gemstone.id, { color: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {DIAMOND_COLORS.map(color => (
                                            <SelectItem key={color} value={color}>{color}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label>Clarity</Label>
                                      <Select
                                        value={gemstone.clarity}
                                        onValueChange={value => handleUpdateGemstone(variant.id, gemstone.id, { clarity: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Clarity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {DIAMOND_CLARITIES.map(clarity => (
                                            <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                      <Label>Rate ($/ct)</Label>
                                      <Input
                                        type="number"
                                        value={gemstone.rate}
                                        onChange={e => handleUpdateGemstone(variant.id, gemstone.id, { rate: e.target.value })}
                                        placeholder="0.00"
                                      />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                      <Label>Cut</Label>
                                      <Select
                                        value={gemstone.cut}
                                        onValueChange={value => handleUpdateGemstone(variant.id, gemstone.id, { cut: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Cut quality" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Excellent">Excellent</SelectItem>
                                          <SelectItem value="Very Good">Very Good</SelectItem>
                                          <SelectItem value="Good">Good</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end">
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleDeleteGemstone(variant.id, gemstone.id)}
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
                                <Label>Making Charge</Label>
                                <div className="flex">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={variant.makingCharge}
                                    onChange={e => handleUpdateVariant(variant.id, { makingCharge: e.target.value })}
                                    className="rounded-r-none"
                                    placeholder="0.00"
                                  />
                                  <Select defaultValue="per-gram">
                                    <SelectTrigger className="rounded-l-none border-l-0">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="per-gram">per gram</SelectItem>
                                      <SelectItem value="fixed">fixed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Wastage (%)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={variant.wastage}
                                  onChange={e => handleUpdateVariant(variant.id, { wastage: e.target.value })}
                                  placeholder="0.0"
                                />
                                {Number(variant.wastage) > 15 && (
                                  <div className="flex items-center text-destructive text-xs mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    High wastage
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label>Total Cost</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                                  $0.00
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Retail Price</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
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
            <p>No variants added yet. Click "Add Variant" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}