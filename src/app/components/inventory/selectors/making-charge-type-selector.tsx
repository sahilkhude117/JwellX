"use client";

import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { ChargeType } from "@prisma/client";

interface MakingChargeTypeOption {
  value: string;
  label: string;
}

interface MakingChargeTypeSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

const makingChargeTypeOptions: MakingChargeTypeOption[] = [
  { value: ChargeType.PERCENTAGE, label: "Percentage" },
  { value: ChargeType.FIXED, label: "Fixed Amount" },
  { value: ChargeType.PER_GRAM, label: "Per Gram" }
];

export default function MakingChargeTypeSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 150,
  disabled = false,
  showBadge = true
}: MakingChargeTypeSelectorProps) {
  return (
    <ContextualSelector<MakingChargeTypeOption>
      items={makingChargeTypeOptions}
      isLoading={false}
      error={null}
      refetch={() => {}}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(item) => item.value}
      getItemName={(item) => item.label}
      placeholder={required ? "Select Making Charge Type" : "Select Making Charge Type (optional)"}
      searchPlaceholder="Search charge types..."
      emptyMessage="No charge types found."
      disabled={disabled}
      width={`w-[${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={false}
    />
  );
}
