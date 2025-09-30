'use client'
import { useDeleteInventoryItem, useBulkDeleteInventoryItems } from "@/hooks/inventory/use-inventory";
import { useInventoryTable } from "@/hooks/inventory/use-inventory-table";
import { InventoryItem } from "@/lib/types/inventory/inventory";
import { useRouter } from "next/navigation";
import { createInventoryColumns } from "./inventory-table-columns";
import { BulkAction, FilterConfig, TableAction } from "@/components/data-table/types";
import { InventoryItemStatus } from "@/generated/prisma";
import { Download, Edit, Eye, Package, Trash2, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table/data-table";
import { useState, useEffect } from "react";
import { BaseDeleteConfig } from "@/components/GlobalDeleteConfirmDialog";
import GlobalDeleteConfirmationDialog from "@/components/GlobalDeleteConfirmDialog";
import { ViewInventoryPopover } from "./view-inventory-popover";
import { AdjustStockPopover } from "./adjust-stock-popover";

interface InventoryTableProps {
    onCreateNew?: () => void;
    onViewItem?: (item: InventoryItem) => void;
    onEditItem?: (item: InventoryItem) => void;
}

const deleteInventoryConfig = {
    inventoryItem: (name: string, isBulk = false, count = 1): BaseDeleteConfig => ({
        title: isBulk ? "Delete Items" : "Delete Item",
        description: isBulk 
            ? `Are you sure you want to delete ${count} selected items?`
            : `Are you sure you want to delete "${name}"?`,
        itemName: isBulk ? `${count} items` : name,
        itemType: isBulk ? "items" : "item",
        confirmButtonText: isBulk ? "Delete Items" : "Delete Item",
    }),
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
    onCreateNew,
    onViewItem,
    onEditItem,
}) => {
    const router = useRouter();
    const [deleteConfig, setDeleteConfig] = useState<{
        isOpen: boolean;
        config: any;
        onConfirm: () => void;
    }>({
        isOpen: false,
        config: null,
        onConfirm: () => {}
    });

    // Add state for view inventory popover
    const [viewInventoryState, setViewInventoryState] = useState<{
        isOpen: boolean;
        inventoryId: string | null;
    }>({
        isOpen: false,
        inventoryId: null,
    });

    // Add state for stock adjustment popover
    const [adjustStockState, setAdjustStockState] = useState<{
        isOpen: boolean;
        inventoryItem: InventoryItem | null;
    }>({
        isOpen: false,
        inventoryItem: null,
    });
    const {
        data,
        totalCount,
        currentPage,
        pageSize,
        loading,
        error,
        onPageChange,
        onPageSizeChange,
        onFiltersChange,
    } = useInventoryTable();

    const deleteInventoryItem = useDeleteInventoryItem();
    const bulkDeleteInventoryItems = useBulkDeleteInventoryItems();

    const handleViewItem = (item: InventoryItem) => {
        if (onViewItem) {
            onViewItem(item);
        } else {
            // Open the view inventory popover
            setViewInventoryState({
                isOpen: true,
                inventoryId: item.id,
            });
        }
    };

    const columns = createInventoryColumns(handleViewItem);

    const filters: FilterConfig[] = [
        {
            key: "search",
            label: "Search",
            type: "search",
            placeholder: "Search by name, SKU, or description...",
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            placeholder: "All Status",
            options: [
                { label: "In Stock", value: InventoryItemStatus.IN_STOCK },
                { label: "Low Stock", value: InventoryItemStatus.LOW_STOCK },
                { label: "Out of Stock", value: InventoryItemStatus.OUT_OF_STOCK },
        ],
        },
        {
            key: "categoryId",
            label: "Category",
            type: "custom-selector",
            placeholder: "All Categories",
        },
        {
            key: "materialId",
            label: "Material",
            type: "custom-selector",
            placeholder: "All Materials",
        },
        {
            key: "gemstoneId",
            label: "Gemstone",
            type: "custom-selector",
            placeholder: "All Gemstones",
        },
        {
            key: "isRawMaterial",
            label: "Raw Material Only",
            type: "toggle",
        },
    ];

    // define row action 
    const actions: TableAction<InventoryItem>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4"/>,
            onClick: handleViewItem
        },
        {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: (item) => {
                if (onEditItem) {
                    onEditItem(item);
                } else {
                    router.push(`/inventory/edit/${item.id}`);
                }
            },
        },
        {
            label: "Adjust Stock",
            icon: <Settings className="h-4 w-4" />,
            onClick: (item) => {
                setAdjustStockState({
                    isOpen: true,
                    inventoryItem: item,
                });
            },
        },
        {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            variant: "destructive",
            onClick: (item) => {
                setDeleteConfig({
                    isOpen: true,
                    config: deleteInventoryConfig.inventoryItem(item.name),
                    onConfirm: () => {
                        deleteInventoryItem.mutate(item.id);
                    }
                })
            },
            disabled: (item) => item.status === InventoryItemStatus.OUT_OF_STOCK,
        },
    ];

    // Define Bulk actions
    const bulkActions: BulkAction<InventoryItem>[] = [
        {
            label: "Delete Selected",
            icon: <Trash2 className="h-4 w-4" />,
            variant: "destructive",
            onClick: (selectedItems) => {
                setDeleteConfig({
                    isOpen: true,
                    config: deleteInventoryConfig.inventoryItem("", true, selectedItems.length),
                    onConfirm: () => {
                        const ids = selectedItems.map(item => item.id);
                        bulkDeleteInventoryItems.mutate(ids);
                    },
                });
            },
        },
    ];

    // Close dialog on successful deletion
    useEffect(() => {
        if (deleteInventoryItem.isSuccess) {
            setDeleteConfig(prev => ({ ...prev, isOpen: false }));
        }
    }, [deleteInventoryItem.isSuccess]);

    useEffect(() => {
        if (bulkDeleteInventoryItems.isSuccess) {
            setDeleteConfig(prev => ({ ...prev, isOpen: false }));
        }
    }, [bulkDeleteInventoryItems.isSuccess]);

    // empty state configuration
    const emptyState = {
        title: "No inventory items found",
        description: "Get started by adding your first inventory item to the system.",
        action: onCreateNew ? {
            label: "Add First Item",
            onClick: onCreateNew,
        } : undefined,
        icon: <Package className="h-12 w-12 text-muted-foreground" />,
    };

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                    Error Loading Inventory
                </h3>
                <p className="text-muted-foreground">
                    {error.message || "Failed to load inventory items"}
                </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                totalCount={totalCount}
                loading={loading}
                filters={filters}
                actions={actions}
                bulkActions={bulkActions}
                emptyState={emptyState}
                enableSorting={true}
                enableSelection={true}
                enablePagination={true}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onFiltersChange={onFiltersChange}
            />
            <GlobalDeleteConfirmationDialog
                isOpen={deleteConfig.isOpen}
                onClose={() => setDeleteConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={deleteConfig.onConfirm}
                config={deleteConfig.config}
                isLoading={deleteInventoryItem.isPending || bulkDeleteInventoryItems.isPending}
            />
            
            <ViewInventoryPopover
                isOpen={viewInventoryState.isOpen}
                onClose={() => setViewInventoryState({ isOpen: false, inventoryId: null })}
                inventoryId={viewInventoryState.inventoryId}
            />
            
            <AdjustStockPopover
                isOpen={adjustStockState.isOpen}
                onClose={() => setAdjustStockState({ isOpen: false, inventoryItem: null })}
                inventoryItem={adjustStockState.inventoryItem}
            />
        </>
    );
}
