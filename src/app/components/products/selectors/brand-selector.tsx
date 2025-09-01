"use client";

import { useState } from "react";
import { ContextualSelector } from "./contextual-selector";
import { useBrands } from "@/hooks/products/use-lookup";
import { BrandOption } from "@/lib/types/products/create-products";
import BrandFormDialog from "@/app/components/products/categories/brand-form-dialog";

interface BrandSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
  width?: number;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function BrandSelector({
  value,
  onChange,
  className = "",
  width = 320,
  disabled = false,
  showBadge = true
}: BrandSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    data: brandsData, 
    isLoading, 
    error,
    refetch 
  } = useBrands();
  
  const brands = brandsData?.brands || [];
  
  const handleAddNewBrand = () => {
    setIsDialogOpen(true);
  };
  
  
  return (
    <>
      <ContextualSelector<BrandOption>
        items={brands}
        isLoading={isLoading}
        error={error ? new Error(error.message) : null}
        refetch={refetch}
        selectedValue={value}
        onSelect={onChange}
        getItemId={(brand) => brand.id}
        getItemName={(brand) => brand.name}
        getItemDescription={(brand) => brand.description || null}
        placeholder="Select brand"
        searchPlaceholder="Search brands..."
        emptyMessage="No brands found."
        addItemLabel="Add New Brand"
        disabled={disabled}
        width={`[w-${width}px]`}
        badgeVariant="outline"
        showBadge={showBadge}
        className={className}
        showAddNew={true}
        onAddNew={handleAddNewBrand}
      />
      
      <BrandFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        mode="create"
      />
    </>
  );
}