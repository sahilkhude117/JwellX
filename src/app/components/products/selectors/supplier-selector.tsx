"use client";

import { useState } from "react";
import { ContextualSelector } from "./contextual-selector";
import { useSuppliers } from "@/hooks/products/use-lookup";
import { SupplierOption } from "@/lib/types/products/create-products";
import SupplierFormDialog from "@/app/components/products/suppliers/supplier-form-dialog";
import { toast } from "sonner";

interface SupplierSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function SupplierSelector({
  value,
  onChange,
  className = "",
  disabled = false,
  showBadge = true
}: SupplierSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    data: suppliersData, 
    isLoading, 
    error,
    refetch 
  } = useSuppliers();
  
  const suppliers = suppliersData?.suppliers || [];
  
  const handleAddNewSupplier = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <ContextualSelector<SupplierOption>
        items={suppliers}
        isLoading={isLoading}
        error={error ? new Error(error.message) : null}
        refetch={refetch}
        selectedValue={value}
        onSelect={onChange}
        getItemId={(supplier) => supplier.id}
        getItemName={(supplier) => supplier.name}
        getItemDescription={(supplier) => 
          supplier.contactNumber ? `📱 ${supplier.contactNumber}` : null
        }
        placeholder="Select supplier"
        searchPlaceholder="Search suppliers..."
        emptyMessage="No suppliers found."
        addItemLabel="Add New Supplier"
        disabled={disabled}
        width="w-[300px]"
        badgeVariant="outline"
        showBadge={showBadge}
        className={className}
        showAddNew={true}
        onAddNew={handleAddNewSupplier}
      />
      
      <SupplierFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        mode="create"
      />
    </>
  );
}