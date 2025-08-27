import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateInventoryItemData } from "@/lib/types/inventory/inventory";
import { Plus, Trash2 } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";

interface MaterialsGemstonesSectionProps {
    control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
    setValue: any;
    materials: Array<{ id: string; name: string; type: string; defaultRate: number; unit: string }>;
    gemstones: Array<{ id: string; name: string; shape: string; defaultRate: number; unit: string }>;
}

export const MaterialsGemstonesSection: React.FC<MaterialsGemstonesSectionProps> = ({
    control,
    setValue,
    materials,
    gemstones,
}) => {
    const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
        control: control,
        name: "materials"
    });

    const { fields: gemstoneFields, append: appendGemstone, remove: removeGemstone } = useFieldArray({
        control: control,
        name: 'gemstones'
    });

    const addMaterial = () => {
        appendMaterial({
            materialId: '',
            weight: 0,
            buyingPrice: 0
        });
    };

    const addGemstone = () => {
        appendGemstone({
            gemstoneId: '',
            weight: 0,
            buyingPrice: 0,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Materials and Gemstones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Materials Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Materials</h4>
                        <Button type="button" variant={'outline'} size={'sm'} onClick={addMaterial}>
                            <Plus className="h-4 w-4 mr-2"/>
                            Add Material
                        </Button>
                    </div>

                    {materialFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-4 gap-4 items-end">
                            <FormField
                                control={control}
                                name={`materials.${index}.materialId`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Material</FormLabel>
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            const material = materials.find(m => m.id === value);
                                            if (material) {
                                                setValue(`materials.${index}.buyingPrice`, material.defaultRate);
                                            }
                                        }} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select material" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {materials.map((material) => (
                                                    <SelectItem key={material.id} value={material.id}>
                                                        {material.name} ({material.type})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`materials.${index}.weight`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`materials.${index}.buyingPrice`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Buying Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step={'0.01'}
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMaterial(index)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Gemstone Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Gemstones</h4>
                        <Button type="button" variant="outline" size="sm" onClick={addGemstone}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Gemstone
                        </Button>
                    </div>

                    {gemstoneFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-4 gap-4 items-end">
                            <FormField
                                control={control}
                                name={`gemstones.${index}.gemstoneId`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gemstone</FormLabel>
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            const gemstone = gemstones.find(g => g.id === value);
                                            if (gemstone) {
                                                setValue(`gemstones.${index}.buyingPrice`, gemstone.defaultRate);
                                            }
                                            }} value={field.value}
                                        >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gemstone" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {gemstones.map((gemstone) => (
                                                <SelectItem key={gemstone.id} value={gemstone.id}>
                                                    {gemstone.name} ({gemstone.shape})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`gemstones.${index}.weight`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`gemstones.${index}.buyingPrice`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Buying Price</FormLabel>
                                        <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeGemstone(index)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}