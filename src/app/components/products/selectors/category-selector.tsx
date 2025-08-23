"use client";

import { useState } from "react";
import { ContextualSelector } from "./contextual-selector";
import CategoryFormDialog from "@/app/components/products/categories/category-form-dialog";
import { useCategories } from "@/hooks/products/use-lookup";
import { CategoryOption } from "@/lib/types/products/create-products";

interface CategorySelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function CategorySelector({
  value,
  onChange,
  required = false,
  className = "",
  disabled = false,
  showBadge = true
}: CategorySelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: categoriesData,
    isLoading: isLoading,
    error: error,
    refetch: refetch
} = useCategories();
  
  const categories = categoriesData?.categories || [];
  
  const handleAddNewCategory = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <ContextualSelector<CategoryOption>
        items={categories}
        isLoading={isLoading}
        error={error ? new Error(error.message) : null}
        refetch={refetch}
        selectedValue={value}
        onSelect={onChange}
        getItemId={(category) => category.id}
        getItemName={(category) => category.name}
        getItemDescription={(category) => category.description || null}
        placeholder={required ? "Select category" : "Select category (optional)"}
        searchPlaceholder="Search categories..."
        emptyMessage="No categories found."
        addItemLabel="Add New Category"
        disabled={disabled}
        width="w-[280px]"
        badgeVariant="secondary"
        showBadge={showBadge}
        className={className}
        showAddNew={true}
        onAddNew={handleAddNewCategory}
      />
      
      <CategoryFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode="create"
      />
    </>
  );
}