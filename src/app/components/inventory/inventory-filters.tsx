// src/components/inventory/inventory-filters.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, RotateCcw } from "lucide-react";
import { InventoryItemStatus } from "@/generated/prisma";
import { InventoryQueryParams } from "@/lib/types/inventory/inventory";

interface InventoryFiltersProps {
  onFiltersChange: (filters: InventoryQueryParams) => void;
  initialFilters?: InventoryQueryParams;
  className?: string;
}

export function InventoryFilters({ 
  onFiltersChange, 
  initialFilters = {},
  className 
}: InventoryFiltersProps) {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [filters, setFilters] = useState<InventoryQueryParams>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Apply filters with debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      const updatedFilters = { ...filters, search: search || undefined };
      onFiltersChange(updatedFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof InventoryQueryParams, value: any) => {
    const newFilters = { ...filters };
    
    if (value === "" || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (search) count++;
    if (filters.status) count++;
    if (filters.categoryId) count++;
    if (filters.isRawMaterial !== undefined) count++;
    if (filters.minWeight || filters.maxWeight) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, SKU, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => 
                    handleFilterChange("status", value === "all" ? undefined : value as InventoryItemStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value={InventoryItemStatus.IN_STOCK}>In Stock</SelectItem>
                    <SelectItem value={InventoryItemStatus.SOLD}>Sold Out</SelectItem>
                    <SelectItem value={InventoryItemStatus.RESERVED}>Reserved</SelectItem>
                    <SelectItem value={InventoryItemStatus.DAMAGED}>Damaged</SelectItem>
                    <SelectItem value={InventoryItemStatus.LOST}>Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Material Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={
                    filters.isRawMaterial === undefined 
                      ? "all" 
                      : filters.isRawMaterial 
                        ? "raw" 
                        : "finished"
                  }
                  onValueChange={(value) => 
                    handleFilterChange(
                      "isRawMaterial", 
                      value === "all" ? undefined : value === "raw"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="finished">Finished Goods</SelectItem>
                    <SelectItem value="raw">Raw Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight Range (grams)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minWeight || ""}
                    onChange={(e) => 
                      handleFilterChange("minWeight", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxWeight || ""}
                    onChange={(e) => 
                      handleFilterChange("maxWeight", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range (₹)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ""}
                    onChange={(e) => 
                      handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ""}
                    onChange={(e) => 
                      handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearch("")}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange("status", undefined)}
              />
            </Badge>
          )}
          {filters.isRawMaterial !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.isRawMaterial ? "Raw Materials" : "Finished Goods"}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange("isRawMaterial", undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}