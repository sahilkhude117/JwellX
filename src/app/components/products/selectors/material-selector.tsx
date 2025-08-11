"use client";

import { useState } from "react";
import { ContextualSelector } from "./contextual-selector";
import { useMaterials } from "@/hooks/products/use-lookup";
import { MaterialOption } from "@/lib/types/products/create-products";
import MaterialFormDialog from "../materials/material-form-dialog";
import { toast } from "sonner";

interface MaterialSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function MaterialSelector({
  value,
  onChange,
  className = "",
  disabled = false,
  showBadge = true
}: MaterialSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    data: materialsData, 
    isLoading, 
    error,
    refetch 
  } = useMaterials();
  
  const materials = materialsData?.materials || [];
  
  const handleAddNewMaterial = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <ContextualSelector<MaterialOption>
        items={materials}
        isLoading={isLoading}
        error={error ? new Error(error.message) : null}
        refetch={refetch}
        selectedValue={value}
        onSelect={onChange}
        getItemId={(material) => material.id}
        getItemName={(material) => material.name}
        getItemDescription={(material) => 
          `${material.type} • ${material.purity} • ${material.defaultRate} ${material.unit}`
        }
        placeholder="Select material (optional)"
        searchPlaceholder="Search materials..."
        emptyMessage="No materials found."
        addItemLabel="Add New Material"
        disabled={disabled}
        width="w-[320px]"
        badgeVariant="outline"
        showBadge={showBadge}
        className={className}
        showAddNew={true}
        onAddNew={handleAddNewMaterial}
      />
      
      <MaterialFormDialog
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(false)}
      />
    </>
  );
}