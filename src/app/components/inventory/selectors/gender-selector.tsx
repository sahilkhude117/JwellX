"use client";

import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { useGenders } from "@/hooks/inventory/use-inventory-lookups";
import { LookupOption } from "@/lib/types/inventory/inventory";

interface GenderSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function GenderSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 150,
  disabled = false,
  showBadge = true
}: GenderSelectorProps) {
  const {
    data: genders,
    isLoading,
    error,
    refetch
  } = useGenders();

  return (
    <ContextualSelector<LookupOption>
      items={genders || []}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      refetch={refetch}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(item) => item.value}
      getItemName={(item) => item.label}
      placeholder={required ? "Select Gender" : "Select Gender"}
      searchPlaceholder="Search genders..."
      emptyMessage="No genders found."
      disabled={disabled}
      width={`w-[${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={false}
    />
  );
}
