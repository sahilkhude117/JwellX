// src/app/inventory/page.tsx
"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

// Components
import { InventoryStats } from "@/app/components/inventory/inventory-stats";
import { InventoryFilters } from "@/app/components/inventory/inventory-filters";
import { InventoryDataTable } from "@/app/components/inventory/inventory-data-table";
import { InventoryEmptyState } from "@/app/components/inventory/inventory-empty-state";
import { createInventoryColumns } from "@/app/components/inventory/inventory-columns";

// Hooks and Types
import { useInventoryItems, useDeleteInventoryItem } from "@/hooks/inventory/use-inventory";
import { InventoryQueryParams, InventoryItem } from "@/lib/types/inventory/inventory";

interface InventoryPageContentProps {
  initialFilters?: InventoryQueryParams;
}

function InventoryPageContent({ initialFilters = {} }: InventoryPageContentProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<InventoryQueryParams>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  // Queries
  const {
    data: inventoryData,
    isLoading,
    error,
    refetch,
  } = useInventoryItems(filters);

  const deleteItemMutation = useDeleteInventoryItem();

  // Memoized data
  const items = useMemo(() => inventoryData?.items || [], [inventoryData?.items]);
  const totalCount = useMemo(() => inventoryData?.total || 0, [inventoryData?.total]);
  const hasFilters = useMemo(() => {
    const { page, limit, ...otherFilters } = filters;
    return Object.keys(otherFilters).length > 0;
  }, [filters]);

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: InventoryQueryParams) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ page: 1, limit: filters.limit });
  }, [filters.limit]);

  const handleCreateItem = useCallback(() => {
    router.push("/inventory/create");
  }, [router]);

  const handleEditItem = useCallback((item: InventoryItem) => {
    router.push(`/inventory/${item.id}/edit`);
  }, [router]);

  const handleViewItem = useCallback((item: InventoryItem) => {
    router.push(`/inventory/${item.id}`);
  }, [router]);

  const handleDuplicateItem = useCallback((item: InventoryItem) => {
    router.push(`/inventory/create?duplicate=${item.id}`);
  }, [router]);

  const handleDeleteItem = useCallback(async (item: InventoryItem) => {
    try {
      await deleteItemMutation.mutateAsync(item.id);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  }, [deleteItemMutation]);

  const handleBulkDelete = useCallback(async (selectedItems: InventoryItem[]) => {
    try {
      await Promise.all(
        selectedItems.map(item => deleteItemMutation.mutateAsync(item.id))
      );
      toast({
        title: "Success",
        description: `${selectedItems.length} items deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some items",
        variant: "destructive",
      });
    }
  }, [deleteItemMutation]);

  const handleBulkExport = useCallback((selectedItems: InventoryItem[]) => {
    // Simple CSV export - in production, you might want a more robust solution
    const csvData = selectedItems.map(item => ({
      Name: item.name,
      SKU: item.sku,
      Category: item.category.name,
      "Gross Weight": item.grossWeight,
      Quantity: item.quantity,
      "Selling Price": item.sellingPrice,
      Status: item.status,
    }));

    const csvString = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `${selectedItems.length} items exported successfully`,
    });
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Table columns
  const columns = useMemo(
    () => createInventoryColumns({
      onEdit: handleEditItem,
      onDelete: handleDeleteItem,
      onView: handleViewItem,
      onDuplicate: handleDuplicateItem,
    }),
    [handleEditItem, handleDeleteItem, handleViewItem, handleDuplicateItem]
  );

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error loading inventory
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message || "Something went wrong"}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showEmptyState = !isLoading && items.length === 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your jewelry inventory, track stock levels, and monitor item details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button onClick={handleCreateItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <InventoryStats />
      </Suspense>

      <Separator />

      {/* Filters */}
      <InventoryFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Content */}
      {showEmptyState ? (
        <InventoryEmptyState
          hasFilters={hasFilters}
          searchTerm={filters.search}
          onClearFilters={handleClearFilters}
          onCreateItem={handleCreateItem}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Inventory Items 
                {totalCount > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({totalCount} total)
                  </span>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryDataTable
              columns={columns}
              data={items}
              isLoading={isLoading}
              totalCount={totalCount}
              page={filters.page || 1}
              pageSize={filters.limit || 20}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onBulkDelete={handleBulkDelete}
              onBulkExport={handleBulkExport}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Main page component with error boundary
export default function InventoryPage() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <InventoryPageContent />
    </Suspense>
  );
}