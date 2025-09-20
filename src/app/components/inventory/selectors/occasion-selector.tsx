"use client";

import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { useOccasions } from "@/hooks/inventory/use-inventory-lookups";
import { LookupOption } from "@/lib/types/inventory/inventory";

interface OccasionSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function OccasionSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 250,
  disabled = false,
  showBadge = true
}: OccasionSelectorProps) {
  const {
    data: occasions,
    isLoading,
    error,
    refetch
  } = useOccasions();

  return (
    <ContextualSelector<LookupOption>
      items={occasions || []}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      refetch={refetch}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(item) => item.value}
      getItemName={(item) => item.label}
      placeholder={required ? "Select Occasion" : "Select Occasion "}
      searchPlaceholder="Search occasions..."
      emptyMessage="No occasions found."
      disabled={disabled}
      width={`w-[${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={false}
    />
  );
}
