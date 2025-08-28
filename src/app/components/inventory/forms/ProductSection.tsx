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
    occasions: Array<{ value: string; label: string }>;
    genders: Array<{ value: string; label: string }>;
    styles: Array<{ value: string; label: string }>;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
    control,
    watch,
    setValue,
    hsnCodes,
    categories,
    brands,
    occasions,
    genders,
    styles
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
                <div className="flex items-center justify-between">
                    <CardTitle>Product Information</CardTitle>
                    <FormField
                        control={control}
                        name="isRawMaterial"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormLabel className="text-sm font-medium">Raw Material</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Name and SKU Row (60/40) */}
                <div className="grid grid-cols-10 gap-4">
                    <div className="col-span-6">
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
                    </div>
                    <div className="col-span-4">
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
                    </div>
                </div>

                {/* HUID and HSN Code Row (30/30) */}
                <div className="grid grid-cols-10 gap-4">
                    <div className="col-span-3">
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
                    </div>
                    <div className="col-span-2">
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
                    <div className="col-span-5 row-span-2">
                        <FormField
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Enter description" 
                                            {...field} 
                                            className="h-[120px] resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-3">
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
                    </div>
                    <div className="col-span-2">
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
                </div>

                {/* Attributes Row - Occasion, Gender, Style */}
                <div className="grid grid-cols-10 gap-4">
                    <div className="col-span-3">
                        <FormField
                        control={control}
                        name="occasion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Occasion</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Occasion"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {occasions.map((occasion) => (
                                            <SelectItem key={occasion.value} value={occasion.value}>
                                                {occasion.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </div>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {genders.map((gender) => (
                                                <SelectItem key={gender.value} value={gender.value}>
                                                    {gender.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="col-span-3">
                        <FormField
                            control={control}
                            name="style"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Style</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {styles.map((style) => (
                                                <SelectItem key={style.value} value={style.value}>
                                                    {style.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}