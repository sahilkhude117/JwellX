import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CreateInventoryItemData } from "@/lib/types/inventory/inventory";
import { Plus, X } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { ItemsTable } from "../add-edit-inventory/ItemsTable";
import { AddEditItemDialog } from "../add-edit-inventory/AddEditItemDialog";

interface MaterialsGemstonesSectionProps {
    control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
    setValue: any;
    watch: any;
    materials: Array<{ id: string; name: string; type: string; defaultRate: number; unit: string }>;
    gemstones: Array<{ id: string; name: string; shape: string; defaultRate: number; unit: string }>;
}

type DialogState = {
    open: boolean;
    mode: 'material' | 'gemstone';
    editIndex: number | null;
    editData: {
        itemId: string;
        weight: number;
        buyingPrice: number
    } | null;
}

export const MaterialsGemstonesSection: React.FC<MaterialsGemstonesSectionProps> = ({
    control,
    setValue,
    watch,
    materials,
    gemstones,
}) => {
    const { fields: materialFields, append: appendMaterial, remove: removeMaterial, update: updateMaterial } = useFieldArray({
        control: control,
        name: "materials"
    });

    const { fields: gemstoneFields, append: appendGemstone, remove: removeGemstone, update: updateGemstone  } = useFieldArray({
        control: control,
        name: 'gemstones'
    });

    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        mode: 'material',
        editIndex: null,
        editData: null,
    })

    const watchedMaterials = watch('materials') || [];
    const watchedGemstones = watch('gemstone') || [];

    const canRemoveMaterial = materialFields.length > 1;

    const handleAddNew = (mode: 'material' | 'gemstone') => {
        setDialogState({
            open: true,
            mode,
            editIndex: null,
            editData: null,
        });
    };

    const handleEdit = (mode: 'material' | 'gemstone', index: number, item: any) => {
        setDialogState({
            open: true,
            mode,
            editIndex: index,
            editData: {
                itemId: mode === 'material' ? item.materialId : item.gemstoneId,
                weight: item.weight,
                buyingPrice: item.buyingPrice,
            },
        });
    };

    const handleDialogSubmit = (data: { itemId: string; weight: number; buyingPrice: number }) => {
        if (dialogState.mode === 'material') {
            const materialData = {
                materialId: data.itemId,
                weight: data.weight,
                buyingPrice: data.buyingPrice,
            };

            if (dialogState.editIndex !== null) {
                updateMaterial(dialogState.editIndex, materialData);
            } else {
                appendMaterial(materialData);
            }
        } else {
            const gemstoneData = {
                gemstoneId: data.itemId,
                weight: data.weight,
                buyingPrice: data.buyingPrice,
            };

            if (dialogState.editIndex !== null) {
                // Update existing gemstone
                updateGemstone(dialogState.editIndex, gemstoneData);
            } else {
                // Add new gemstone
                appendGemstone(gemstoneData);
            }
        }

        setDialogState({
            open: false,
            mode: 'material',
            editIndex: null,
            editData: null,
        });
    };

    const handleDelete = (mode: 'material' | 'gemstone', index: number) => {
        if (mode === 'material') {
            if (canRemoveMaterial) {
                removeMaterial(index);
            }
        } else {
            removeGemstone(index)
        }
    }

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Materials</h4>
                                <Button
                                    type="button"
                                    variant='outline'
                                    size={'sm'}
                                    onClick={() => handleAddNew('material')}
                                    className="h-8"
                                >
                                    <Plus className="h-3 w-3 mr-1"/>
                                    Add New
                                </Button>
                            </div>

                            {materialFields.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    At least one material is required
                                </div>
                            ) : (
                                <ItemsTable
                                    mode="material"
                                    items={watchedMaterials.map((material, index) => ({
                                        id: materialFields[index]?.id || `material-${index}`,
                                        itemId: material.materialId,
                                        weight: material.weight,
                                        buyingPrice: material.buyingPrice,
                                    }))}             
                                    materials={materials}
                                    onEdit={(index, item) => handleEdit('material', index, watchedMaterials[index])}
                                    onDelete={(index) => handleDelete('material', index)}
                                    canDelete={canRemoveMaterial}                           
                                />
                            )}

                            {materialFields.length === 0 && (
                                <FormMessage>At least one material is required</FormMessage>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Gemstones</h4>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleAddNew('gemstone')}
                                    className="h-8"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add New
                                </Button>
                            </div>

                            {gemstoneFields.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    No gemstones added
                                </div>
                            ) : (
                                <ItemsTable
                                    mode="gemstone"
                                    items={watchedGemstones.map((gemstone, index) => ({
                                        id: gemstoneFields[index]?.id || `gemstone-${index}`,
                                        itemId: gemstone.gemstoneId,
                                        weight: gemstone.weight,
                                        buyingPrice: gemstone.buyingPrice,
                                    }))}
                                    gemstones={gemstones}
                                    onEdit={(index, item) => handleEdit('gemstone', index, watchedGemstones[index])}
                                    onDelete={(index) => handleDelete('gemstone', index)}
                                    canDelete={true}
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AddEditItemDialog
                open={dialogState.open}
                onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
                mode={dialogState.mode}
                onSubmit={handleDialogSubmit}
                editData={dialogState.editData}
                materials={materials}
                gemstones={gemstones}
            />
        </>
    )
}