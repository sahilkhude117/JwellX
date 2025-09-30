import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FilterConfig } from "./types";
import CategorySelector from "@/app/components/products/selectors/category-selector";
import MaterialSelector from "@/app/components/products/selectors/material-selector";
import GemstoneSelector from "@/app/components/products/selectors/gemstone-selector";
import ProductSelector from "@/app/components/products/selectors/product-selector";
import UserSelector from "@/app/components/selectors/users/user-selector";
import { Switch } from "../ui/switch";
import SupplierSelector from "@/app/components/products/selectors/supplier-selector";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";

interface TableFiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  values,
  onChange,
  onClear,
}) => {
  const hasActiveFilters = Object.values(values).some(value => 
    value !== undefined && value !== "" && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const renderCustomSelector = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.key) {
      case 'categoryId':
        return (
          <CategorySelector
            value={value || null}
            onChange={(val) => onChange(filter.key, val || undefined)}
            showBadge={false}
            required={true}
            className="w-[280px]"
          />
        );

      case "materialId":
        return (
          <MaterialSelector
            value={value || null}
            onChange={(val) => onChange(filter.key, val || undefined)}
            showBadge={false}
            className="w-[320px]"
          />
        );
      
      case "gemstoneId":
        return (
          <GemstoneSelector
            value={value || null}
            onChange={(val) => onChange(filter.key, val || undefined)}
            showBadge={false}
            className="w-[350px]"
          />
        );

      case 'supplierId':
        return (
          <SupplierSelector
            value={value || null}
            onChange={(val) => onChange(filter.key, val || undefined)}
            showBadge={false}
            className="w-[350px]"
          />
        );

      case 'inventoryItemId':
        return (
          <ProductSelector
            value={value || null}
            onChange={(val) => onChange(filter.key, val || undefined)}
            showBadge={false}
            className="w-[280px]"
          />
        );

      case 'userId':
        return (
          <UserSelector
            value={value || null}
            onChange={(val) => onChange(filter.key, val || undefined)}
            showBadge={false}
            className="w-[280px]"
          />
        );

        default:
          return null;
    }
  }

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case "search":
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={filter.placeholder || "Search..."}
              value={value || ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        );

      case "select":
        return (
          <Select
            value={value || "all"}
            onValueChange={(val) => onChange(filter.key, val === 'all' ? undefined : val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'custom-selector':
        return renderCustomSelector(filter);

      case "multi-select":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48 justify-start">
                {selectedValues.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{selectedValues.length} selected</span>
                    {selectedValues.slice(0, 2).map((val) => (
                      <Badge key={val} variant="secondary" className="text-xs">
                        {filter.options?.find(opt => opt.value === val)?.label}
                      </Badge>
                    ))}
                    {selectedValues.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedValues.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  filter.placeholder || `Select ${filter.label}`
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                {filter.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...selectedValues, option.value]
                          : selectedValues.filter((v) => v !== option.value);
                        onChange(filter.key, newValues);
                      }}
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );

      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={filter.key}
              checked={value || false}
              onCheckedChange={(checked) => onChange(filter.key, checked)}
            />
            <Label htmlFor={filter.key} className="text-sm font-medium">
              {filter.label}
            </Label>
          </div>
        );

      case "date-range":
        return (
          <DatePickerWithRange
            date={value}
            onDateChange={(dateRange) => onChange(filter.key, dateRange)}
            placeholder={filter.placeholder || "Select date range"}
            className="w-[300px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="flex items-center space-x-2 flex-wrap">
        {filters.map((filter) => (
          <div className="mt-2" key={filter.key}>
            {renderFilter(filter)}
          </div>
        ))}
      </div>
      
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="flex items-center space-x-1"
        >
          <X className="h-4 w-4" />
          <span>Clear</span>
        </Button>
      )}
    </div>
  );
};