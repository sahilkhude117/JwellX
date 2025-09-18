import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateInventoryItemData } from "@/lib/types/inventory/inventory";
import { Plus, Trash2, AlertCircle, Info } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import MaterialSelector from "../../products/selectors/material-selector";
import GemstoneSelector from "../../products/selectors/gemstone-selector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMaterials } from "@/hooks/products/use-lookup";
import { useGemstones } from "@/hooks/products/use-lookup";
import { calculateBuyingCostBreakdown, gramsToMg, rupeesToPaise, mgToGrams, paiseToRupees, roundToTwoDecimals, formatPriceRupees } from "@/lib/utils/inventory/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface MaterialsGemstonesSectionProps {
    control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
    setValue: any;
    watch: any;
}

interface MaterialRow {
    materialId: string;
    weight: number;
    buyingPrice: number;
}

interface GemstoneRow {
    gemstoneId: string;
    weight: number;
    buyingPrice: number;
}

export const MaterialsGemstonesSection: React.FC<MaterialsGemstonesSectionProps> = ({
    control,
    setValue,
    watch,
}) => {
    const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
        control: control,
        name: "materials"
    });

    const { fields: gemstoneFields, append: appendGemstone, remove: removeGemstone } = useFieldArray({
        control: control,
        name: 'gemstones'
    });

    const watchedMaterials = watch('materials') || [];
    const watchedGemstones = watch('gemstones') || [];

    const canRemoveMaterial = materialFields.length > 1;

    // Validation functions to prevent duplicate selections
    const isMaterialAlreadySelected = (materialId: string, currentIndex: number) => {
        return watchedMaterials.some((m: any, index: number) =>
            index !== currentIndex && m.materialId === materialId
        );
    };

    const isGemstoneAlreadySelected = (gemstoneId: string, currentIndex: number) => {
        return watchedGemstones.some((g: any, index: number) =>
            index !== currentIndex && g.gemstoneId === gemstoneId
        );
    };

    // Calculate buying cost in display units (grams/rupees) for real-time updates
    const buyingCostTotal = React.useMemo(() => {
        const materials = watchedMaterials.filter((m: any) => m.materialId && m.weight > 0 && m.buyingPrice > 0);
        const gemstones = watchedGemstones.filter((g: any) => g.gemstoneId && g.weight > 0 && g.buyingPrice > 0);

        if (materials.length === 0 && gemstones.length === 0) return 0;

        const materialsTotal = materials.reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0);
        const gemstonesTotal = gemstones.reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0);

        return roundToTwoDecimals(materialsTotal + gemstonesTotal);
    }, [watchedMaterials, watchedGemstones]);

    // Update buying price and gross weight in parent form when materials/gemstones change
    React.useEffect(() => {
        if (buyingCostTotal > 0) {
            setValue('buyingPrice', buyingCostTotal);
        }

        // Calculate and update gross weight
        const materialsWeight = watchedMaterials
            .filter((m: any) => m.materialId && m.weight > 0)
            .reduce((sum: number, m: any) => sum + m.weight, 0);
        const gemstonesWeight = watchedGemstones
            .filter((g: any) => g.gemstoneId && g.weight > 0)
            .reduce((sum: number, g: any) => sum + g.weight, 0);
        const grossWeight = materialsWeight + gemstonesWeight;
        setValue('grossWeight', roundToTwoDecimals(grossWeight));
    }, [buyingCostTotal, watchedMaterials, watchedGemstones, setValue]);

    // Add new material row
    const handleAddMaterial = () => {
        appendMaterial({
            materialId: '',
            weight: 0,
            buyingPrice: 0,
        });
    };

    // Add new gemstone row
    const handleAddGemstone = () => {
        appendGemstone({
            gemstoneId: '',
            weight: 0,
            buyingPrice: 0,
        });
    };

    return (
        <TooltipProvider>
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Materials Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Materials</h4>
                                <Button
                                    type="button"
                                    variant='outline'
                                    size={'sm'}
                                    onClick={handleAddMaterial}
                                    className="h-8"
                                >
                                    <Plus className="h-3 w-3 mr-1"/>
                                    Add New
                                </Button>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Weight (g)</TableHead>
                                            <TableHead>Buying Price/g (₹)</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {materialFields.map((field, index) => {
                                            const materialId = watchedMaterials[index]?.materialId;
                                            
                                            return (
                                                <TableRow key={field.id}>
                                                    <TableCell className="w-[150px]">
                                                        <FormField
                                                            control={control}
                                                            name={`materials.${index}.materialId`}
                                                            render={({ field, fieldState }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="flex items-center gap-2">
                                                                            <MaterialSelector
                                                                                value={field.value || ''}
                                                                                onChange={(value) => {
                                                                                    if (value && isMaterialAlreadySelected(value, index)) {
                                                                                        toast({
                                                                                            title: "Material Already Selected",
                                                                                            description: "This material is already used in another row. Please select a different material.",
                                                                                            variant: "destructive"
                                                                                        });
                                                                                        return;
                                                                                    }
                                                                                    field.onChange(value);
                                                                                }}
                                                                                showBadge={false}
                                                                                className={`flex-1 ${fieldState.error ? 'border-red-500' : ''}`}
                                                                            />
                                                                            {fieldState.error && (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p className="text-xs">{fieldState.error.message}</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        </div>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="w-[100px]">
                                                        <FormField
                                                            control={control}
                                                            name={`materials.${index}.weight`}
                                                            render={({ field, fieldState }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="flex items-center gap-1">
                                                                            <Input
                                                                                {...field}
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                placeholder="0.00"
                                                                                disabled={!materialId}
                                                                                className={`h-8 text-xs px-2 ${fieldState.error ? 'border-red-500' : ''} ${!materialId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                                    onChange={(e) => {
                                                                                        const value = parseFloat(e.target.value) || 0;
                                                                                        field.onChange(value);
                                                                                        // Trigger real-time update by calculating combined total
                                                                                        setTimeout(() => {
                                                                                            const updatedMaterials = [...watchedMaterials];
                                                                                            if (updatedMaterials[index]) {
                                                                                                updatedMaterials[index] = { ...updatedMaterials[index], weight: value };
                                                                                            }
                                                                                            const materialsTotal = updatedMaterials
                                                                                                .filter((m: any) => m.materialId && m.weight > 0 && m.buyingPrice > 0)
                                                                                                .reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0);
                                                                                            const gemstonesTotal = watchedGemstones
                                                                                                .filter((g: any) => g.gemstoneId && g.weight > 0 && g.buyingPrice > 0)
                                                                                                .reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0);
                                                                                            const combinedTotal = materialsTotal + gemstonesTotal;

                                                                                            // Update buying price
                                                                                            setValue('buyingPrice', roundToTwoDecimals(combinedTotal));

                                                                                            // Update gross weight
                                                                                            const materialsWeight = updatedMaterials
                                                                                                .filter((m: any) => m.materialId && m.weight > 0)
                                                                                                .reduce((sum: number, m: any) => sum + m.weight, 0);
                                                                                            const gemstonesWeight = watchedGemstones
                                                                                                .filter((g: any) => g.gemstoneId && g.weight > 0)
                                                                                                .reduce((sum: number, g: any) => sum + g.weight, 0);
                                                                                            const grossWeight = materialsWeight + gemstonesWeight;
                                                                                            setValue('grossWeight', roundToTwoDecimals(grossWeight));
                                                                                        }, 0);
                                                                                    }}
                                                                            />
                                                                            {!materialId && (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <Info className="h-3 w-3 text-gray-400" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p className="text-xs">Select material first</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                            {fieldState.error && materialId && (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p className="text-xs">{fieldState.error.message}</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        </div>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="w-[120px]">
                                                        <FormField
                                                            control={control}
                                                            name={`materials.${index}.buyingPrice`}
                                                            render={({ field, fieldState }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="flex items-center gap-1">
                                                                            <Input
                                                                                {...field}
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                placeholder="0.00"
                                                                                disabled={!materialId}
                                                                                className={`h-8 text-xs px-2 ${fieldState.error ? 'border-red-500' : ''} ${!materialId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                                onChange={(e) => {
                                                                                    const value = parseFloat(e.target.value) || 0;
                                                                                    field.onChange(value);
                                                                                    // Trigger real-time update by calculating combined total
                                                                                    setTimeout(() => {
                                                                                        const updatedMaterials = [...watchedMaterials];
                                                                                        if (updatedMaterials[index]) {
                                                                                            updatedMaterials[index] = { ...updatedMaterials[index], buyingPrice: value };
                                                                                        }
                                                                                        const materialsTotal = updatedMaterials
                                                                                            .filter((m: any) => m.materialId && m.weight > 0 && m.buyingPrice > 0)
                                                                                            .reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0);
                                                                                        const gemstonesTotal = watchedGemstones
                                                                                            .filter((g: any) => g.gemstoneId && g.weight > 0 && g.buyingPrice > 0)
                                                                                            .reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0);
                                                                                        const combinedTotal = materialsTotal + gemstonesTotal;

                                                                                        // Update buying price
                                                                                        setValue('buyingPrice', roundToTwoDecimals(combinedTotal));

                                                                                        // Update gross weight
                                                                                        const materialsWeight = updatedMaterials
                                                                                            .filter((m: any) => m.materialId && m.weight > 0)
                                                                                            .reduce((sum: number, m: any) => sum + m.weight, 0);
                                                                                        const gemstonesWeight = watchedGemstones
                                                                                            .filter((g: any) => g.gemstoneId && g.weight > 0)
                                                                                            .reduce((sum: number, g: any) => sum + g.weight, 0);
                                                                                        const grossWeight = materialsWeight + gemstonesWeight;
                                                                                        setValue('grossWeight', roundToTwoDecimals(grossWeight));
                                                                                    }, 0);
                                                                                }}
                                                                            />
                                                                            {!materialId && (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <Info className="h-3 w-3 text-gray-400" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p className="text-xs">Select material first</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                            {fieldState.error && materialId && (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p className="text-xs">{fieldState.error.message}</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        </div>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeMaterial(index)}
                                                            disabled={!canRemoveMaterial}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Trash2 className="h-3 w-3 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {materialFields.length === 0 && (
                                <div className="text-sm text-red-500">At least one material is required</div>
                            )}
                        </div>

                        {/* Gemstones Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Gemstones</h4>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAddGemstone}
                                    className="h-8"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add New
                                </Button>
                            </div>

                            {gemstoneFields.length === 0 ? (
                                <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                                    No gemstones added
                                </div>
                            ) : (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Gemstone</TableHead>
                                                <TableHead>Weight (ct)</TableHead>
                                                <TableHead>Buying Price/ct (₹)</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {gemstoneFields.map((field, index) => {
                                                const gemstoneId = watchedGemstones[index]?.gemstoneId;
                                                
                                                return (
                                                    <TableRow key={field.id}>
                                                        <TableCell className="w-[150px]">
                                                            <FormField
                                                                control={control}
                                                                name={`gemstones.${index}.gemstoneId`}
                                                                render={({ field, fieldState }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <div className="flex items-center gap-2">
                                                                                <GemstoneSelector
                                                                                    value={field.value || ''}
                                                                                    onChange={(value) => {
                                                                                        if (value && isGemstoneAlreadySelected(value, index)) {
                                                                                            toast({
                                                                                                title: "Gemstone Already Selected",
                                                                                                description: "This gemstone is already used in another row. Please select a different gemstone.",
                                                                                                variant: "destructive"
                                                                                            });
                                                                                            return;
                                                                                        }
                                                                                        field.onChange(value);
                                                                                    }}
                                                                                    showBadge={false}
                                                                                    className={`flex-1 ${fieldState.error ? 'border-red-500' : ''}`}
                                                                                />
                                                                                {fieldState.error && (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p className="text-xs">{fieldState.error.message}</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-[100px]">
                                                            <FormField
                                                                control={control}
                                                                name={`gemstones.${index}.weight`}
                                                                render={({ field, fieldState }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <div className="flex items-center gap-1">
                                                                                <Input
                                                                                    {...field}
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    placeholder="0.00"
                                                                                    disabled={!gemstoneId}
                                                                                    className={`h-8 px-2 text-xs ${fieldState.error ? 'border-red-500' : ''} ${!gemstoneId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                                    onChange={(e) => {
                                                                                        const value = parseFloat(e.target.value) || 0;
                                                                                        field.onChange(value);
                                                                                        // Trigger real-time update by calculating combined total
                                                                                        setTimeout(() => {
                                                                                            const updatedGemstones = [...watchedGemstones];
                                                                                            if (updatedGemstones[index]) {
                                                                                                updatedGemstones[index] = { ...updatedGemstones[index], weight: value };
                                                                                            }
                                                                                            const materialsTotal = watchedMaterials
                                                                                                .filter((m: any) => m.materialId && m.weight > 0 && m.buyingPrice > 0)
                                                                                                .reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0);
                                                                                            const gemstonesTotal = updatedGemstones
                                                                                                .filter((g: any) => g.gemstoneId && g.weight > 0 && g.buyingPrice > 0)
                                                                                                .reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0);
                                                                                            const combinedTotal = materialsTotal + gemstonesTotal;

                                                                                            // Update buying price
                                                                                            setValue('buyingPrice', roundToTwoDecimals(combinedTotal));

                                                                                            // Update gross weight
                                                                                            const materialsWeight = watchedMaterials
                                                                                                .filter((m: any) => m.materialId && m.weight > 0)
                                                                                                .reduce((sum: number, m: any) => sum + m.weight, 0);
                                                                                            const gemstonesWeight = updatedGemstones
                                                                                                .filter((g: any) => g.gemstoneId && g.weight > 0)
                                                                                                .reduce((sum: number, g: any) => sum + g.weight, 0);
                                                                                            const grossWeight = materialsWeight + gemstonesWeight;
                                                                                            setValue('grossWeight', roundToTwoDecimals(grossWeight));
                                                                                        }, 0);
                                                                                    }}
                                                                                />
                                                                                {!gemstoneId && (
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <Info className="h-3 w-3 text-gray-400" />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p className="text-xs">Select gemstone first</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                )}
                                                                                {fieldState.error && gemstoneId && (
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p className="text-xs">{fieldState.error.message}</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                )}
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-[120px]">
                                                            <FormField
                                                                control={control}
                                                                name={`gemstones.${index}.buyingPrice`}
                                                                render={({ field, fieldState }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <div className="flex items-center gap-1">
                                                                                <Input
                                                                                    {...field}
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    placeholder="0.00"
                                                                                    disabled={!gemstoneId}
                                                                                    className={`h-8 px-2 text-xs ${fieldState.error ? 'border-red-500' : ''} ${!gemstoneId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                                    onChange={(e) => {
                                                                                        const value = parseFloat(e.target.value) || 0;
                                                                                        field.onChange(value);
                                                                                        // Trigger real-time update by calculating combined total
                                                                                        setTimeout(() => {
                                                                                            const updatedGemstones = [...watchedGemstones];
                                                                                            if (updatedGemstones[index]) {
                                                                                                updatedGemstones[index] = { ...updatedGemstones[index], buyingPrice: value };
                                                                                            }
                                                                                            const materialsTotal = watchedMaterials
                                                                                                .filter((m: any) => m.materialId && m.weight > 0 && m.buyingPrice > 0)
                                                                                                .reduce((sum: number, m: any) => sum + (m.weight * m.buyingPrice), 0);
                                                                                            const gemstonesTotal = updatedGemstones
                                                                                                .filter((g: any) => g.gemstoneId && g.weight > 0 && g.buyingPrice > 0)
                                                                                                .reduce((sum: number, g: any) => sum + (g.weight * g.buyingPrice), 0);
                                                                                            const combinedTotal = materialsTotal + gemstonesTotal;

                                                                                            // Update buying price
                                                                                            setValue('buyingPrice', roundToTwoDecimals(combinedTotal));

                                                                                            // Update gross weight
                                                                                            const materialsWeight = watchedMaterials
                                                                                                .filter((m: any) => m.materialId && m.weight > 0)
                                                                                                .reduce((sum: number, m: any) => sum + m.weight, 0);
                                                                                            const gemstonesWeight = updatedGemstones
                                                                                                .filter((g: any) => g.gemstoneId && g.weight > 0)
                                                                                                .reduce((sum: number, g: any) => sum + g.weight, 0);
                                                                                            const grossWeight = materialsWeight + gemstonesWeight;
                                                                                            setValue('grossWeight', roundToTwoDecimals(grossWeight));
                                                                                        }, 0);
                                                                                    }}
                                                                                />
                                                                                {!gemstoneId && (
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <Info className="h-3 w-3 text-gray-400" />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p className="text-xs">Select gemstone first</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                )}
                                                                                {fieldState.error && gemstoneId && (
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p className="text-xs">{fieldState.error.message}</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                )}
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeGemstone(index)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Trash2 className="h-3 w-3 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>


                </CardContent>
            </Card>
        </TooltipProvider>
    )
}
