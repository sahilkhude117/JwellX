// src/components/inventory/inventory-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from "lucide-react";
import { InventoryItem,} from "@/lib/types/inventory/inventory";
import { formatCurrency, formatWeight } from "@/lib/utils/inventory/utils";
import { InventoryItemStatus } from "@prisma/client";

interface InventoryColumnsProps {
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onView?: (item: InventoryItem) => void;
  onDuplicate?: (item: InventoryItem) => void;
}

export const createInventoryColumns = ({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
}: InventoryColumnsProps = {}): ColumnDef<InventoryItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="min-w-[200px]">
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">{item.sku}</div>
          {item.huid && (
            <div className="text-xs text-blue-600">HUID: {item.huid}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <Badge variant="outline" className="font-normal">
          {category.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "grossWeight",
    header: "Weight",
    cell: ({ row }) => {
      const weight = row.getValue("grossWeight") as number;
      return <div className="font-medium">{formatWeight(weight)}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      const status = row.original.status;
      
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{quantity}</span>
          {/* {status === InventoryItemStatus.LOW_STOCK && (
            <Badge variant="destructive" className="text-xs">
              Low
            </Badge>
          )}
          {status === InventoryItemStatus.OUT_OF_STOCK && (
            <Badge variant="secondary" className="text-xs">
              Out
            </Badge>
          )} */}
        </div>
      );
    },
  },
  {
    accessorKey: "materials",
    header: "Buying Price",
    cell: ({ row }) => {
      const item = row.original;
      const totalBuyingPrice = item.materials.reduce(
        (acc, material) => acc + (material.weight * material.buyingPrice), 
        0
      ) + (item.gemstones || []).reduce(
        (acc, gemstone) => acc + (gemstone.weight * gemstone.buyingPrice), 
        0
      );
      
      return (
        <div className="text-right font-medium">
          {formatCurrency(totalBuyingPrice)}
        </div>
      );
    },
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling Price",
    cell: ({ row }) => {
      const price = row.getValue("sellingPrice") as number;
      return <div className="text-right font-medium">{formatCurrency(price)}</div>;
    },
  },
  {
    id: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      const item = row.original;
      const totalValue = item.sellingPrice * item.quantity;
      return <div className="text-right font-medium">{formatCurrency(totalValue)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as InventoryItemStatus;
      
      const statusConfig = {
        [InventoryItemStatus.IN_STOCK]: { 
          variant: "default" as const, 
          label: "In Stock" 
        },
        [InventoryItemStatus.DAMAGED]: { 
          variant: "default" as const, 
          label: "Damaged" 
        },
        [InventoryItemStatus.LOST]: { 
          variant: "default" as const, 
          label: "Lost" 
        },
        [InventoryItemStatus.SOLD]: { 
          variant: "default" as const, 
          label: "Sold" 
        },
        // [InventoryItemStatus.LOW_STOCK]: { 
        //   variant: "destructive" as const, 
        //   label: "Low Stock" 
        // },
        // [InventoryItemStatus.OUT_OF_STOCK]: { 
        //   variant: "secondary" as const, 
        //   label: "Out of Stock" 
        // },
        // [InventoryItemStatus.DISCONTINUED]: { 
        //   variant: "outline" as const, 
        //   label: "Discontinued" 
        // },
      };
      
      //@ts-ignore
      const config = statusConfig[status];
      
      return (
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(item)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(item)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];