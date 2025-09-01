import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateInventoryItemData } from "@/lib/types/inventory/inventory";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import MaterialSelector from "../../products/selectors/material-selector";
import GemstoneSelector from "../../products/selectors/gemstone-selector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMaterials } from "@/hooks/products/use-lookup";
import { useGemstones } from "@/hooks/products/use-lookup";

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
                                            <TableHead>BuyingPrice (₹)</TableHead>
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
                                                                                onChange={field.onChange}
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
                                                                                placeholder="0.00"
                                                                                className={`h-8 text-xs px-2 ${fieldState.error ? 'border-red-500' : ''}`}
                                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                    <TableCell className="w-[150px]">
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
                                                                                placeholder="0.00"
                                                                                className={`h-8 text-xs px-2 ${fieldState.error ? 'border-red-500' : ''}`}
                                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                <TableHead>BuyingPrice (₹)</TableHead>
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
                                                                                    onChange={field.onChange}
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
                                                                                    placeholder="0.00"
                                                                                    className={`h-8 px-2 text-xs ${fieldState.error ? 'border-red-500' : ''}`}
                                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                                        <TableCell className="w-[150px]">
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
                                                                                    placeholder="0.00"
                                                                                    className={`h-8  px-2 text-xs ${fieldState.error ? 'border-red-500' : ''}`}
                                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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