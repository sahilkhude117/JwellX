"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContextualSelector } from "./contextual-selector";
import { useProducts } from "@/hooks/products/use-lookup";
import { ProductOption } from "@/lib/types/products/create-products";

interface ProductSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function ProductSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 320,
  disabled = false,
  showBadge = true
}: ProductSelectorProps) {
  const router = useRouter();

  const {
    data: productsData,
    isLoading: isLoading,
    error: error,
    refetch: refetch
  } = useProducts();
  
  const products = productsData?.products || [];
  
  const handleAddNewProduct = () => {
    router.push("/inventory/add");
  };
  
  return (
    <ContextualSelector<ProductOption>
      items={products}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      refetch={refetch}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(product) => product.id}
      getItemName={(product) => product.name}
      getItemDescription={(product) => product.sku ? `SKU: ${product.sku}` : product.description || null}
      placeholder={required ? "Select product" : "Select product"}
      searchPlaceholder="Search products..."
      emptyMessage="No products found."
      addItemLabel="Add New Product"
      disabled={disabled}
      width={`[w-${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={true}
      onAddNew={handleAddNewProduct}
    />
  );
}