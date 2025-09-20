"use client";

import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { useStyles } from "@/hooks/inventory/use-inventory-lookups";
import { LookupOption } from "@/lib/types/inventory/inventory";

interface StyleSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function StyleSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 200,
  disabled = false,
  showBadge = true
}: StyleSelectorProps) {
  const {
    data: styles,
    isLoading,
    error,
    refetch
  } = useStyles();

  return (
    <ContextualSelector<LookupOption>
      items={styles || []}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      refetch={refetch}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(item) => item.value}
      getItemName={(item) => item.label}
      placeholder={required ? "Select Style" : "Select Style"}
      searchPlaceholder="Search styles..."
      emptyMessage="No styles found."
      disabled={disabled}
      width={`w-[${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={false}
    />
  );
}
