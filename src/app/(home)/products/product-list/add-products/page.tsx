'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Upload, X, Save, FileText, Package } from 'lucide-react';

interface Material {
  id: string;
  materialType: string;
  purity: string;
  weight: number;
}

interface Gemstone {
  id: string;
  gemstoneType: string;
  caratWeight: number;
  cut?: string;
  color?: string;
  clarity?: string;
  certificateNumber?: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  totalWeight: number;
  makingCharge: number;
  wastage?: number;
  initialStock: number;
  materials: Material[];
  gemstones: Gemstone[];
}

interface ProductAttribute {
  id: string;
  attributeName: string;
  value: string;
}

interface ProductForm {
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  hsnCode: string;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
}

const AddNewProductPage = () => {
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    hsnCode: '',
    attributes: [],
    variants: []
  });

  const [expandedSections, setExpandedSections] = useState<string[]>(['product-details']);

  // Mock data for dropdowns
  const categories = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants'];
  const brands = ['Tiffany & Co.', 'Cartier', 'Bulgari', 'Van Cleef & Arpels'];
  const materials = ['Gold', 'Silver', 'Platinum', 'Palladium', 'Rhodium'];
  const gemstones = ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Amethyst'];
  const attributeNames = ['Style', 'Occasion', 'Collection', 'Gender', 'Age Group'];

  const addAttribute = () => {
    const newAttribute: ProductAttribute = {
      id: `attr-${Date.now()}`,
      attributeName: '',
      value: ''
    };
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute]
    }));
  };

  const removeAttribute = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(attr => attr.id !== id)
    }));
  };

  const updateAttribute = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr => 
        attr.id === id ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      sku: `${formData.sku}-VAR-${formData.variants.length + 1}`,
      totalWeight: 0,
      makingCharge: 0,
      wastage: 0,
      initialStock: 0,
      materials: [],
      gemstones: []
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== id)
    }));
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const addMaterial = (variantId: string) => {
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      materialType: '',
      purity: '',
      weight: 0
    };
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, materials: [...variant.materials, newMaterial] }
          : variant
      )
    }));
  };

  const removeMaterial = (variantId: string, materialId: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, materials: variant.materials.filter(m => m.id !== materialId) }
          : variant
      )
    }));
  };

  const updateMaterial = (variantId: string, materialId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { 
              ...variant, 
              materials: variant.materials.map(material => 
                material.id === materialId ? { ...material, [field]: value } : material
              )
            }
          : variant
      )
    }));
  };

  const addGemstone = (variantId: string) => {
    const newGemstone: Gemstone = {
      id: `gemstone-${Date.now()}`,
      gemstoneType: '',
      caratWeight: 0,
      cut: '',
      color: '',
      clarity: '',
      certificateNumber: ''
    };
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, gemstones: [...variant.gemstones, newGemstone] }
          : variant
      )
    }));
  };

  const removeGemstone = (variantId: string, gemstoneId: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, gemstones: variant.gemstones.filter(g => g.id !== gemstoneId) }
          : variant
      )
    }));
  };

  const updateGemstone = (variantId: string, gemstoneId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant.id === variantId 
          ? { 
              ...variant, 
              gemstones: variant.gemstones.map(gemstone => 
                gemstone.id === gemstoneId ? { ...gemstone, [field]: value } : gemstone
              )
            }
          : variant
      )
    }));
  };

  const handleSave = () => {
    console.log('Saving product:', formData);
    // Implement save logic here
  };

  const handleSaveAndAddAnother = () => {
    console.log('Saving product and adding another:', formData);
    // Implement save and clear form logic here
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Add New Product</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleSaveAndAddAnother} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Save & Add Another
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Accordion 
          type="multiple" 
          value={expandedSections} 
          onValueChange={setExpandedSections}
          className="space-y-6"
        >
          {/* Section 1: Core Product Information */}
          <AccordionItem value="product-details" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5" />
                <span className="text-lg font-semibold">Product Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Elegant Gold Necklace"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productSku">Product SKU *</Label>
                  <Input
                    id="productSku"
                    placeholder="e.g., NECK-GOLD-001"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="border-gray-300"
                  />
                  <p className="text-sm text-gray-500">A unique code for this product. Can be auto-generated or manually entered.</p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the product, its design, and features."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="border-gray-300 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                      <SelectItem value="add-new">+ Create New Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={formData.brand} onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                      <SelectItem value="add-new">+ Create New Brand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hsnCode">HSN Code</Label>
                  <Input
                    id="hsnCode"
                    placeholder="HSN/SAC code for tax purposes"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, hsnCode: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600">Drag and drop images here, or click to browse</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose Images
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Product Attributes */}
          <AccordionItem value="product-attributes" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="border-gray-300">
                  {formData.attributes.length}
                </Badge>
                <span className="text-lg font-semibold">Product Attributes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-4">
                Define specific characteristics like Style, Occasion, Collection, etc. These help in filtering and search.
              </p>
              
              <div className="space-y-4">
                {formData.attributes.map((attribute) => (
                  <div key={attribute.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <Select 
                        value={attribute.attributeName} 
                        onValueChange={(value) => updateAttribute(attribute.id, 'attributeName', value)}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributeNames.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                          <SelectItem value="add-new">+ Create New Attribute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Value"
                        value={attribute.value}
                        onChange={(e) => updateAttribute(attribute.id, 'value', e.target.value)}
                        className="border-gray-300"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(attribute.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addAttribute}
                  className="w-full border-dashed border-gray-300 hover:border-gray-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 3: Product Variants */}
          <AccordionItem value="product-variants" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="border-gray-300">
                  {formData.variants.length}
                </Badge>
                <span className="text-lg font-semibold">Product Variants</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-4">
                Define different versions of this product, e.g., based on size, metal purity, or gemstone. Each variant has its own SKU, pricing, and stock.
              </p>

              <div className="space-y-6">
                {formData.variants.map((variant, index) => (
                  <Card key={variant.id} className="border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Variant {index + 1}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(variant.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Variant Basic Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Variant SKU *</Label>
                          <Input
                            placeholder="e.g., RING-DIA-001-18W-S6"
                            value={variant.sku}
                            onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Weight (grams) *</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 5.5"
                            value={variant.totalWeight || ''}
                            onChange={(e) => updateVariant(variant.id, 'totalWeight', parseFloat(e.target.value) || 0)}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Making Charge *</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 1500 (fixed) or 15 (%)"
                            value={variant.makingCharge || ''}
                            onChange={(e) => updateVariant(variant.id, 'makingCharge', parseFloat(e.target.value) || 0)}
                            className="border-gray-300"
                          />
                          <p className="text-sm text-gray-500">Enter a fixed amount or a percentage.</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Wastage (%)</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 5"
                            value={variant.wastage || ''}
                            onChange={(e) => updateVariant(variant.id, 'wastage', parseFloat(e.target.value) || 0)}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Initial Stock Quantity *</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 10"
                            value={variant.initialStock || ''}
                            onChange={(e) => updateVariant(variant.id, 'initialStock', parseInt(e.target.value) || 0)}
                            className="border-gray-300"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Materials Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium">Materials Composition</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addMaterial(variant.id)}
                            className="border-gray-300"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Material
                          </Button>
                        </div>
                        
                        {variant.materials.map((material) => (
                          <div key={material.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                            <div className="space-y-2">
                              <Label>Material Type *</Label>
                              <Select 
                                value={material.materialType} 
                                onValueChange={(value) => updateMaterial(variant.id, material.id, 'materialType', value)}
                              >
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                  {materials.map(mat => (
                                    <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                                  ))}
                                  <SelectItem value="add-new">+ Create New Material</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Purity *</Label>
                              <Input
                                placeholder="e.g., 22K, 18K, 925 Silver"
                                value={material.purity}
                                onChange={(e) => updateMaterial(variant.id, material.id, 'purity', e.target.value)}
                                className="border-gray-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Weight (grams) *</Label>
                              <Input
                                type="number"
                                placeholder="Weight of this material"
                                value={material.weight || ''}
                                onChange={(e) => updateMaterial(variant.id, material.id, 'weight', parseFloat(e.target.value) || 0)}
                                className="border-gray-300"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMaterial(variant.id, material.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Gemstones Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium">Gemstone Details</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addGemstone(variant.id)}
                            className="border-gray-300"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Gemstone
                          </Button>
                        </div>
                        
                        {variant.gemstones.map((gemstone) => (
                          <div key={gemstone.id} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Gemstone Type *</Label>
                                <Select 
                                  value={gemstone.gemstoneType} 
                                  onValueChange={(value) => updateGemstone(variant.id, gemstone.id, 'gemstoneType', value)}
                                >
                                  <SelectTrigger className="border-gray-300">
                                    <SelectValue placeholder="Select gemstone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {gemstones.map(gem => (
                                      <SelectItem key={gem} value={gem}>{gem}</SelectItem>
                                    ))}
                                    <SelectItem value="add-new">+ Create New Gemstone</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Carat Weight *</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="e.g., 0.5"
                                  value={gemstone.caratWeight || ''}
                                  onChange={(e) => updateGemstone(variant.id, gemstone.id, 'caratWeight', parseFloat(e.target.value) || 0)}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeGemstone(variant.id, gemstone.id)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Cut</Label>
                                <Input
                                  placeholder="e.g., Round, Princess, Emerald"
                                  value={gemstone.cut || ''}
                                  onChange={(e) => updateGemstone(variant.id, gemstone.id, 'cut', e.target.value)}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Color</Label>
                                <Input
                                  placeholder="e.g., D, E, F (for diamonds)"
                                  value={gemstone.color || ''}
                                  onChange={(e) => updateGemstone(variant.id, gemstone.id, 'color', e.target.value)}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Clarity</Label>
                                <Input
                                  placeholder="e.g., FL, IF, VVS1, VVS2"
                                  value={gemstone.clarity || ''}
                                  onChange={(e) => updateGemstone(variant.id, gemstone.id, 'clarity', e.target.value)}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Certificate Number</Label>
                                <Input
                                  placeholder="Search by existing certificate or add new"
                                  value={gemstone.certificateNumber || ''}
                                  onChange={(e) => updateGemstone(variant.id, gemstone.id, 'certificateNumber', e.target.value)}
                                  className="border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addVariant}
                  className="w-full border-dashed border-gray-300 hover:border-gray-400 h-12"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Sticky Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-end space-x-4">
          <Button variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSaveAndAddAnother} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Save & Add Another
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProductPage;