"use client";

import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { useLocations } from "@/hooks/inventory/use-inventory-lookups";
import { LookupOption } from "@/lib/types/inventory/inventory";

interface LocationSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function LocationSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 200,
  disabled = false,
  showBadge = true
}: LocationSelectorProps) {
  const {
    data: locations,
    isLoading,
    error,
    refetch
  } = useLocations();

  return (
    <ContextualSelector<LookupOption>
      items={locations || []}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      refetch={refetch}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(item) => item.value}
      getItemName={(item) => item.label}
      placeholder={required ? "Select Location" : "Select Location"}
      searchPlaceholder="Search locations..."
      emptyMessage="No locations found."
      disabled={disabled}
      width={`w-[${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={false}
    />
  );
}
