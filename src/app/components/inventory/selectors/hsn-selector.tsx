"use client";

import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { useHsnCodes } from "@/hooks/inventory/use-inventory-lookups";
import { LookupOption } from "@/lib/types/inventory/inventory";

interface HsnSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function HsnSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 250,
  disabled = false,
  showBadge = true
}: HsnSelectorProps) {
  const {
    data: hsnCodes,
    isLoading,
    error,
    refetch
  } = useHsnCodes();

  return (
    <ContextualSelector<LookupOption>
      items={hsnCodes || []}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      refetch={refetch}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(item) => item.value}
      getItemName={(item) => item.label}
      placeholder={required ? "Select HSN Code" : "Select HSN Code"}
      searchPlaceholder="Search HSN codes..."
      emptyMessage="No HSN codes found."
      disabled={disabled}
      width={`w-[${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={false}
    />
  );
}
