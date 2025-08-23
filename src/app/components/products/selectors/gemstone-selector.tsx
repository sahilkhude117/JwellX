"use client";

import { useState } from "react";
import { ContextualSelector } from "./contextual-selector";
import { useGemstones } from "@/hooks/products/use-lookup";
import { GemstoneOption } from "@/lib/types/products/create-products";
import GemstoneFormDialog from "../materials/gemstone-form-dialog";
import { toast } from "sonner";

interface GemstoneSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function GemstoneSelector({
  value,
  onChange,
  className = "",
  disabled = false,
  showBadge = true
}: GemstoneSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    data: gemstonesData, 
    isLoading, 
    error,
    refetch 
  } = useGemstones();
  
  const gemstones = gemstonesData?.gemstones || [];
  
  const handleAddNewGemstone = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <ContextualSelector<GemstoneOption>
        items={gemstones}
        isLoading={isLoading}
        error={error ? new Error(error.message) : null}
        refetch={refetch}
        selectedValue={value}
        onSelect={onChange}
        getItemId={(gemstone) => gemstone.id}
        getItemName={(gemstone) => gemstone.name}
        getItemDescription={(gemstone) => 
          `${gemstone.shape} • ${gemstone.clarity} • ${gemstone.color} • ${gemstone.defaultRate} ${gemstone.unit}`
        }
        placeholder="Select gemstone"
        searchPlaceholder="Search gemstones..."
        emptyMessage="No gemstones found."
        addItemLabel="Add New Gemstone"
        disabled={disabled}
        width="w-[350px]"
        badgeVariant="outline"
        showBadge={showBadge}
        className={className}
        showAddNew={true}
        onAddNew={handleAddNewGemstone}
      />
      
      <GemstoneFormDialog
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(false)}
      />
    </>
  );
}