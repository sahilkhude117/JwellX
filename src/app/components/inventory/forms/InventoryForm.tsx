import { useCreateInventoryItem, useInventoryItem, useUpdateInventoryItem } from "@/hooks/inventory/use-inventory";
import { toast } from "@/hooks/use-toast";
import { CreateInventoryItemData, createInventoryItemSchema, FormMode, updateInventoryItemSchema } from "@/lib/types/inventory/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChargeType } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { ProductSection } from "./ProductSection";
import { AttributesSection } from "./AttributesSection";
import { MaterialsGemstonesSection } from "./MaterialsGemstonesSection";
import { Button } from "@/components/ui/button";
import { SummarySection } from "./SummarySection";
import { InventoryFormSkeleton } from "./InventoryFormSkeleton";
import { PricingSection } from "./PricingSection";

interface InventoryFormProps {
  mode: FormMode;
  onSuccess?: () => void;
}

const mockData = {
  hsnCodes: [
    { value: '7113', label: '7113 - Articles of jewellery' },
    { value: '7114', label: '7114 - Articles of goldsmiths' },
    { value: '7115', label: '7115 - Other articles of precious metal' },
  ],
  categories: [
    { id: '187dec02-f3f9-4ca3-9085-8418bcb6e217', name: 'ring' },
  ],
  brands: [
    { id: '187dec02-f3f9-4ca3-9085-8418bcb6e217', name: 't' },
  ],
  occasions: [
    { value: 'wedding', label: 'Wedding' },
    { value: 'festival', label: 'Festival' },
    { value: 'casual', label: 'Casual' },
    { value: 'party', label: 'Party' },
  ],
  genders: [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'unisex', label: 'Unisex' },
  ],
  styles: [
    { value: 'traditional', label: 'Traditional' },
    { value: 'modern', label: 'Modern' },
    { value: 'contemporary', label: 'Contemporary' },
  ],
  materials: [
    { id: '187dec02-f3f9-4ca3-9085-8418bcb6e217', name: 'Gold', type: 'GOLD', defaultRate: 5000, unit: 'g' },
  ],
  gemstones: [
    { id: '187dec02-f3f9-4ca3-9085-8418bcb6e217', name: 'sdf', shape: 'PEAR', defaultRate: 10000, unit: 'ct' },
  ],
  locations: [
    { value: 'showroom-1', label: 'Main Showroom' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'online', label: 'Online Store' },
  ],
};

export const InventoryForm: React.FC<InventoryFormProps> = ({ mode, onSuccess }) => {
    const isEdit = mode.mode === 'edit';
    const itemId = mode.itemId;

    const { data: existingItem, isLoading: isLoadingItem } = useInventoryItem(itemId || '');

    const createMutation = useCreateInventoryItem();
    const updateMutation = useUpdateInventoryItem();

    const defaultValues: Partial<CreateInventoryItemData> = {
        name: '',
        sku: '',
        description: '',
        hsnCode: '',
        huid: '',
        grossWeight: 0,
        wastage: 0,
        quantity: 1,
        location: '',
        sellingPrice: 0,
        buyingPrice: 0,
        isRawMaterial: false,
        gender: '',
        occasion: '',
        style: '',
        makingChargeType: ChargeType.PERCENTAGE,
        makingChargeValue: 0,
        categoryId: '',
        brandId: '',
        materials: [{ materialId: '', weight: 0, buyingPrice: 0 }],
        gemstones: [],
    };

    const form = useForm<CreateInventoryItemData | Partial<CreateInventoryItemData>>({
        resolver: zodResolver(isEdit ? updateInventoryItemSchema : createInventoryItemSchema),
        defaultValues,
        mode: 'onChange',
    })

    // load existing data for edit mode
    React.useEffect(() => {
        if (isEdit && existingItem?.item) {
            const item = existingItem.item;
            form.reset({
                name: item.name,
                sku: item.sku,
                description: item.description || '',
                hsnCode: item.hsnCode || '',
                huid: item.huid || '',
                grossWeight: item.grossWeight,
                wastage: item.wastage || 0,
                quantity: item.quantity,
                location: item.location || '',
                sellingPrice: item.sellingPrice,
                buyingPrice: item.buyingPrice || 0,
                isRawMaterial: item.isRawMaterial,
                gender: item.gender || '',
                occasion: item.occasion || '',
                style: item.style || '',
                makingChargeType: item.makingChargeType,
                makingChargeValue: item.makingChargeValue,
                categoryId: item.category.id,
                brandId: item.brand?.id || '',
                materials: item.materials.map(m => ({
                    materialId: m.material.id,
                    weight: m.weight,
                    buyingPrice: m.buyingPrice,
                })),
                gemstones: item.gemstones?.map(g => ({
                    gemstoneId: g.gemstone.id,
                    weight: g.weight,
                    buyingPrice: g.buyingPrice,
                })) || [],
            });
        }
    }, [isEdit, existingItem, form]);

    const onSubmit = async (data: CreateInventoryItemData | Partial<CreateInventoryItemData>) => {
        try {
            if (isEdit && itemId) {
                await updateMutation.mutateAsync({id: itemId, data });
            } else {
                await createMutation.mutateAsync(data as CreateInventoryItemData);
            }
            onSuccess?.();
        } catch (error) {
            toast({
                title: "Error Saving Product",
                variant: 'destructive'
            })
        }
    };

    const onSaveAndAddAnother = async (data: CreateInventoryItemData | Partial<CreateInventoryItemData>) => {
        try {
            if (!isEdit) {
                await createMutation.mutateAsync(data as CreateInventoryItemData);
                form.reset(defaultValues);
            }
        } catch (error) {
            toast({
                title: "Save and add another error:",
                variant: 'destructive'
            })
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (isEdit && isLoadingItem) {
        return <InventoryFormSkeleton />;
    }

    if (!form) {
        return <InventoryFormSkeleton />;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Edit Inventory Item' : "Add New Inventory Item"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? 'Update inventory item details' : 'Create a new inventory item for your jewelry shop'}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - 2/3 width */}
                        <div className="lg:col-span-2 space-y-6">
                            <ProductSection
                                control={form.control}
                                watch={form.watch}
                                setValue={form.setValue}
                                hsnCodes={mockData.hsnCodes}
                                categories={mockData.categories}
                                brands={mockData.brands}
                            />

                            <AttributesSection
                                control={form.control}
                                occasions={mockData.occasions}
                                genders={mockData.genders}
                                styles={mockData.styles}
                            />
                            
                            <MaterialsGemstonesSection
                                control={form.control}
                                setValue={form.setValue}
                                materials={mockData.materials}
                                gemstones={mockData.gemstones}
                            />

                            <div className="flex gap-4">
                                {!isEdit && (
                                    <Button
                                        type="button"
                                        variant='outline'
                                        onClick={form.handleSubmit(onSaveAndAddAnother)}
                                        disabled={isLoading}
                                    >
                                        Save & Add Another
                                    </Button>
                                )}
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Item' : 'Save Item')}
                                </Button>
                            </div>
                        </div>

                        {/* Right Column - 1/3 width */}
                        <div className="space-y-6">
                            <PricingSection
                                control={form.control}
                                watch={form.watch}
                                setValue={form.setValue}
                                getValues={form.getValues}
                                locations={mockData.locations}
                            />

                            <SummarySection 
                                control={form.control}
                                watch={form.watch}
                                setValue={form.setValue}
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}