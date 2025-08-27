import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateInventoryItemData } from "@/lib/types/inventory/inventory";
import { generateSKU } from "@/lib/utils/inventory/utils";
import { useEffect } from "react";
import { Control } from "react-hook-form";

interface ProductSectionProps {
    control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
    watch: any;
    setValue: any;
    hsnCodes: Array<{ value: string; label: string }>;
    categories: Array<{ id: string; name: string }>;
    brands: Array<{ id: string; name: string }>;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
    control,
    watch,
    setValue,
    hsnCodes,
    categories,
    brands
}) => {
    const productName = watch('name');
    const materials = watch('materials') || [];

    useEffect(() => {
        if (productName && materials.length > 0) {
            const totalWeight: number = (materials as Array<{ weight: number }>).reduce(
                (sum: number, m: { weight: number }) => sum + m.weight,
                0
            );
            const sku = generateSKU(productName, totalWeight);
            setValue('sku', sku);
        }
    }, [productName, materials, setValue]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex- Mangalsutra 12g" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="hsnCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>HSN Code</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select HSN Code"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {hsnCodes.map((code) => (
                                            <SelectItem key={code.value} value={code.value}>
                                                {code.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU (Auto-generated)</FormLabel>
                            <FormControl>
                                <Input {...field} readOnly className="bg-muted" />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter description" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={control}
                        name="huid"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>HUID</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter HUID" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="brandId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Brand"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={control}
                    name="isRawMaterial"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Raw Material</FormLabel>
                            <div className="text-sm text-muted-foreground">
                                Mark as raw material if applicable
                            </div>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}