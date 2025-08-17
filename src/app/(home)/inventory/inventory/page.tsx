"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategorySelector from "@/app/components/products/selectors/category-selector";
import BrandSelector from "@/app/components/products/selectors/brand-selector";
import MaterialSelector from "@/app/components/products/selectors/material-selector";
import { Button } from "@/components/ui/button";
import GemstoneSelector from "@/app/components/products/selectors/gemstone-selector";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBrands, useCategories, useGemstones, useMaterials } from "@/hooks/products/use-lookup";

// Types & Schemas
export interface InventoryItemFormData {
  id?: string;
  name: string;
  sku: string;
  hsnCode: string;
  huid: string;
  description: string;
  categoryId: string;
  brandId?: string;
  occasion: string;
  gender: string;
  style: string;
  materials: Array<{
    id: string;
    weight: number;
    buyingPrice: number;
  }>;
  gemstones: Array<{
    id: string;
    weight: number;
    buyingPrice: number;
  }>;
  makingChargeType: "PERCENTAGE" | "PER_GRAM" | "FIXED";
  makingChargeValue: number;
  wastage: number;
  location: string;
  quantity: number;
  isAutoCalculated: boolean;
  buyingCost: number;
}

const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  hsnCode: z.string().optional(),
  huid: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  occasion: z.string().min(1, "Occasion is required"),
  gender: z.string().min(1, "Gender is required"),
  style: z.string().min(1, "Style is required"),
  materials: z.array(
    z.object({
      id: z.string().min(1),
      weight: z.number().positive("Weight must be positive"),
      buyingPrice: z.number().positive("Buying price must be positive"),
    })
  ),
  gemstones: z.array(
    z.object({
      id: z.string().min(1),
      weight: z.number().positive("Weight must be positive"),
      buyingPrice: z.number().positive("Buying price must be positive"),
    })
  ),
  makingChargeType: z.enum(["PERCENTAGE", "PER_GRAM", "FIXED"]),
  makingChargeValue: z.number().positive("Making charge must be positive"),
  wastage: z.number().positive("Wastage must be positive"),
  location: z.string().min(1, "Location is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  isAutoCalculated: z.boolean(),
  buyingCost: z.number().positive("Buying cost must be positive").optional(),
});

// Components
interface ProductFormSectionProps {
  formMethods: any;
  categories: any[];
  brands: any[];
}

function ProductFormSection({ formMethods, categories, brands }: ProductFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={formMethods.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={formMethods.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="SKU75996" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={formMethods.control}
          name="hsnCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HSN Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter HSN code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={formMethods.control}
          name="huid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HUID</FormLabel>
              <FormControl>
                <Input placeholder="Optional HUID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={formMethods.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <FormField
            control={formMethods.control}
            name="occasion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occasion</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Diwali">Diwali</SelectItem>
                    <SelectItem value="Dasara">Dasara</SelectItem>
                    <SelectItem value="Gudhipadwa">Gudhipadwa</SelectItem>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                    <SelectItem value="Anniversary">Anniversary</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={formMethods.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={formMethods.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Style</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Traditional">Traditional</SelectItem>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Minimalist">Minimalist</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Category/Brand Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategorySelector
            value={formMethods.watch("categoryId")}
            onChange={(value) => formMethods.setValue("categoryId", value)}
            required
          />
          
          <BrandSelector
            value={formMethods.watch("brandId")}
            onChange={(value) => formMethods.setValue("brandId", value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface MaterialsGemstonesSectionProps {
  formMethods: any;
  materialsData: any;
  gemstonesData: any;
}

function MaterialsGemstonesSection({ formMethods, materialsData, gemstonesData }: MaterialsGemstonesSectionProps) {
  const [materials, setMaterials] = useState(formMethods.watch("materials"));
  const [gemstones, setGemstones] = useState(formMethods.watch("gemstones"));
  
  const handleMaterialAdd = () => {
    setMaterials([...materials, { id: "", weight: 0, buyingPrice: 0 }]);
  };
  
  const handleMaterialRemove = (index: number) => {
    const newMaterials = [...materials];
    newMaterials.splice(index, 1);
    setMaterials(newMaterials);
  };
  
  const handleGemstoneAdd = () => {
    setGemstones([...gemstones, { id: "", weight: 0, buyingPrice: 0 }]);
  };
  
  const handleGemstoneRemove = (index: number) => {
    const newGemstones = [...gemstones];
    newGemstones.splice(index, 1);
    setGemstones(newGemstones);
  };
  
  useEffect(() => {
    formMethods.setValue("materials", materials);
    formMethods.setValue("gemstones", gemstones);
  }, [materials, gemstones]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials & Gemstones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Materials</h3>
          {materials.map((material: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <MaterialSelector
                value={material.id}
                onChange={(id) => {
                  const newMaterials = [...materials];
                  newMaterials[index].id = id;
                  setMaterials(newMaterials);
                }}
                disabled={false}
                showBadge={false}
              />
              
              <Input
                type="number"
                step="0.01"
                min="0"
                value={material.weight}
                onChange={(e) => {
                  const newMaterials = [...materials];
                  newMaterials[index].weight = parseFloat(e.target.value);
                  setMaterials(newMaterials);
                }}
                placeholder="Weight (g)"
                className="w-24"
              />
              
              <Input
                type="number"
                step="0.01"
                min="0"
                value={material.buyingPrice}
                onChange={(e) => {
                  const newMaterials = [...materials];
                  newMaterials[index].buyingPrice = parseFloat(e.target.value);
                  setMaterials(newMaterials);
                }}
                placeholder="₹0.00"
                className="w-24"
              />
              
              <Button
                variant="outline"
                onClick={() => handleMaterialRemove(index)}
                className="ml-auto"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleMaterialAdd}
            className="w-full mt-2"
          >
            + Add Material
          </Button>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Gemstones</h3>
          {gemstones.map((gemstone: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <GemstoneSelector
                value={gemstone.id}
                onChange={(id) => {
                  const newGemstones = [...gemstones];
                  newGemstones[index].id = id;
                  setGemstones(newGemstones);
                }}
                disabled={false}
                showBadge={false}
              />
              
              <Input
                type="number"
                step="0.01"
                min="0"
                value={gemstone.weight}
                onChange={(e) => {
                  const newGemstones = [...gemstones];
                  newGemstones[index].weight = parseFloat(e.target.value);
                  setGemstones(newGemstones);
                }}
                placeholder="Weight (ct)"
                className="w-24"
              />
              
              <Input
                type="number"
                step="0.01"
                min="0"
                value={gemstone.buyingPrice}
                onChange={(e) => {
                  const newGemstones = [...gemstones];
                  newGemstones[index].buyingPrice = parseFloat(e.target.value);
                  setGemstones(newGemstones);
                }}
                placeholder="₹0.00"
                className="w-24"
              />
              
              <Button
                variant="outline"
                onClick={() => handleGemstoneRemove(index)}
                className="ml-auto"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleGemstoneAdd}
            className="w-full mt-2"
          >
            + Add Gemstone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface InventoryPricingSectionProps {
  formMethods: any;
}

function InventoryPricingSection({ formMethods }: InventoryPricingSectionProps) {
  const [isAutoCalculated, setIsAutoCalculated] = useState(formMethods.watch("isAutoCalculated"));
  const [buyingCost, setBuyingCost] = useState(formMethods.watch("buyingCost"));
  
  // Calculate total cost based on materials and gemstones
  const totalMaterialCost = formMethods.watch("materials").reduce(
    (sum, material) => sum + (material.weight * material.buyingPrice),
    0
  );
  
  const totalGemstoneCost = formMethods.watch("gemstones").reduce(
    (sum, gemstone) => sum + (gemstone.weight * gemstone.buyingPrice),
    0
  );
  
  const totalWeight = formMethods.watch("materials").reduce(
    (sum, material) => sum + material.weight,
    0
  ) + formMethods.watch("gemstones").reduce(
    (sum, gemstone) => sum + gemstone.weight,
    0
  );
  
  const makingCharge = (() => {
    const value = formMethods.watch("makingChargeValue");
    switch (formMethods.watch("makingChargeType")) {
      case "PERCENTAGE":
        return (totalMaterialCost + totalGemstoneCost) * (value / 100);
      case "PER_GRAM":
        return totalWeight * value;
      case "FIXED":
        return value;
      default:
        return 0;
    }
  })();
  
  const wastageCost = (totalMaterialCost + totalGemstoneCost) * (formMethods.watch("wastage") / 100);
  
  const finalCost = makingCharge + wastageCost + totalMaterialCost + totalGemstoneCost;
  
  useEffect(() => {
    formMethods.setValue("isAutoCalculated", isAutoCalculated);
    formMethods.setValue("buyingCost", isAutoCalculated ? finalCost : buyingCost);
  }, [isAutoCalculated, buyingCost]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory & Price</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="buyingCost">Buying Cost</Label>
            <Tooltip>
              <TooltipTrigger className="text-xs text-muted-foreground">(?)</TooltipTrigger>
              <TooltipContent>This is calculated based on materials, gemstones, wastage, and making charges</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoCalculate"
              checked={isAutoCalculated}
              onChange={(e) => setIsAutoCalculated(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="autoCalculate" className="text-sm">
              Auto calculated
            </label>
          </div>
        </div>
        
        <Input
          type="number"
          step="0.01"
          min="0"
          value={isAutoCalculated ? "" : buyingCost}
          onChange={(e) => setBuyingCost(parseFloat(e.target.value))}
          placeholder={`₹${finalCost.toFixed(2)} (auto)`}
          disabled={isAutoCalculated}
          className="mb-4"
        />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Making Charges</span>
            <span>₹{makingCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Wastage ({formMethods.watch("wastage")}%)</span>
            <span>₹{wastageCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Weight</span>
            <span>{totalWeight.toFixed(2)} g</span>
          </div>
          <div className="flex justify-between">
            <span>Items Present</span>
            <span>{formMethods.watch("quantity")}</span>
          </div>
          <div className="flex justify-between font-medium text-lg">
            <span>Final Cost</span>
            <span>₹{finalCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Page Component
export default function AddEditInventoryPage() {
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const { data: materialsData } = useMaterials();
  const { data: gemstonesData } = useGemstones();
  
  const form = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      hsnCode: "",
      huid: "",
      description: "",
      categoryId: "",
      brandId: "",
      occasion: "Wedding",
      gender: "Unisex",
      style: "Traditional",
      materials: [{ id: "", weight: 0, buyingPrice: 0 }],
      gemstones: [{ id: "", weight: 0, buyingPrice: 0 }],
      makingChargeType: "PERCENTAGE",
      makingChargeValue: 10,
      wastage: 5,
      location: "Shop",
      quantity: 1,
      isAutoCalculated: true,
      buyingCost: 0,
    },
  });
  
  const onSubmit = (data: InventoryItemFormData) => {
    console.log("Submitted:", data);
    // Submit to API
  };
  
  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add Inventory</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductFormSection 
            formMethods={form}
            categories={categoriesData?.categories || []}
            brands={brandsData?.brands || []}
          />
          
          <div className="space-y-6">
            <MaterialsGemstonesSection 
              formMethods={form}
              materialsData={materialsData}
              gemstonesData={gemstonesData}
            />
            
            <InventoryPricingSection formMethods={form} />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button type="button">
            Save & Add Another
          </Button>
          <Button type="submit" form="inventoryForm">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}