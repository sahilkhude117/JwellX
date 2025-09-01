"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Props interface for the generic ContextualSelector
interface ContextualSelectorProps<T> {
  // Data-related props
  items: T[];
  isLoading: boolean;
  error: Error | null;
  refetch?: () => void;
  
  // Selection handling
  selectedValue: string | null;
  onSelect: (value: string) => void;
  
  // Display configuration
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
  getItemDescription?: (item: T) => string | null;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  addItemLabel?: string;
  
  // UI configuration
  disabled?: boolean;
  width?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  showBadge?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  showAddNew?: boolean;
  onAddNew?: () => void;
}

export function ContextualSelector<T>({
  items,
  isLoading,
  error,
  refetch,
  selectedValue,
  onSelect,
  getItemId,
  getItemName,
  getItemDescription = () => null,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  addItemLabel = "Add New",
  disabled = false,
  width = "w-[250px]",
  badgeVariant = "secondary",
  showBadge = true,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  showAddNew = false,
  onAddNew
}: ContextualSelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Reset search when dialog closes (if needed in parent)
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);
  
  // Filter items based on search
  const filteredItems = items.filter(item => 
    getItemName(item).toLowerCase().includes(search.toLowerCase())
  );
  
  // Get name of selected item
  const getSelectedName = () => {
    if (!selectedValue) return "";
    const selectedItem = items.find(item => getItemId(item) === selectedValue);
    return selectedItem ? getItemName(selectedItem) : "";
  };
  
  // Handle item selection
  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
    setSearch("");
  };
  
  // Handle adding new item
  const handleAddNew = () => {
    setOpen(false);
    setSearch("");
    onAddNew?.();
  };
  
  return (
    <div className={cn("flex flex-col", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled || isLoading || !!error}
            className={cn(
              `justify-between ${width}`,
              error && "border-destructive",
              triggerClassName
            )}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : error ? (
              <span className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-4 w-4" />
                Error
              </span>
            ) : selectedValue ? (
              getSelectedName()
            ) : (
              placeholder
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(width, "p-0", contentClassName)}>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {error ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                  Failed to load items.
                  {refetch && (
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={refetch}
                    >
                      Try again
                    </Button>
                  )}
                </div>
              ) : isLoading ? (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  {filteredItems.length > 0 && (
                    <CommandGroup heading="Items">
                      {filteredItems.map((item) => (
                        <CommandItem
                          key={getItemId(item)}
                          value={getItemId(item)}
                          onSelect={handleSelect}
                          className="flex items-center gap-2"
                        >
                          {getItemName(item)}
                          {getItemDescription(item) && (
                            <span className="text-xs text-muted-foreground ml-2 truncate max-w-[120px]">
                              {getItemDescription(item)}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {showAddNew && onAddNew && (
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleAddNew}
                        className="text-primary cursor-pointer flex items-center"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {addItemLabel}
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Optional badge for selected item */}
      {showBadge && selectedValue && (
        <Badge
          variant={badgeVariant}
          className="mt-1 max-w-[200px] truncate"
        >
          {getSelectedName()}
        </Badge>
      )}
    </div>
  );
}