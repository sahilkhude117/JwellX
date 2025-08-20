// src/components/inventory/inventory-empty-state.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Search, Filter } from "lucide-react";

interface InventoryEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateItem?: () => void;
  searchTerm?: string;
  className?: string;
}

export function InventoryEmptyState({
  hasFilters = false,
  onClearFilters,
  onCreateItem,
  searchTerm,
  className,
}: InventoryEmptyStateProps) {
  if (hasFilters || searchTerm) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No items found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {searchTerm 
              ? `No inventory items match your search for "${searchTerm}"`
              : "No inventory items match your current filters"}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            {onClearFilters && (
              <Button variant="outline" onClick={onClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            )}
            {onCreateItem && (
              <Button onClick={onCreateItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add new item
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No inventory items yet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Get started by adding your first inventory item. You can add finished jewelry pieces, 
          raw materials, or gemstones to track your stock.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          {onCreateItem && (
            <Button onClick={onCreateItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first item
            </Button>
          )}
          <Button variant="outline">
            Import from CSV
          </Button>
        </div>
        
        {/* Quick tips */}
        <div className="mt-8 text-left">
          <h4 className="text-sm font-medium text-foreground mb-2">
            Quick tips:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Track finished jewelry with materials and gemstones</li>
            <li>• Manage raw materials like gold, silver, and findings</li>
            <li>• Set low stock alerts to avoid running out</li>
            <li>• Use SKUs and HUIDs for easy identification</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}