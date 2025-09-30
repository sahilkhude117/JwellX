import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InventoryItem } from "@/lib/types/inventory/inventory";
import { InventoryItemStatus } from "@/generated/prisma";
import { formatWeightGrams, formatPriceRupees, paiseToRupees, mgToGrams } from "@/lib/utils/inventory/utils";

export const createInventoryColumns = (onViewItem?: (item: InventoryItem) => void): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div 
        className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-1 -m-1 rounded transition-colors" 
        onClick={() => onViewItem?.(row.original)}
        title="Click to view details"
      >
        <div>
          <div className="font-medium text-primary hover:text-primary/80">{row.getValue("name")}</div>
          <div className="text-xs ">{row.original.category.name}</div>
        </div>
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        SKU
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">{row.getValue("sku")}</div>
    ),
    size: 120,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground text-center">
        {row.getValue("location") || "—"}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Quantity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-center">
        {row.getValue("quantity")}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as InventoryItemStatus;
      const statusConfig = {
        [InventoryItemStatus.IN_STOCK]: {
          label: "In Stock",
          variant: "default" as const
        },
        [InventoryItemStatus.LOW_STOCK]: {
          label: "Low Stock",
          variant: "secondary" as const
        },
        [InventoryItemStatus.OUT_OF_STOCK]: {
          label: "Out of Stock",
          variant: "destructive" as const
        },
      };

      return (
        <Badge variant={statusConfig[status]?.variant || "default"}>
          {statusConfig[status]?.label || status}
        </Badge>
      );
    },
    size: 120,
  },
  {
    accessorKey: "grossWeight",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Weight
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const weightInMg = row.getValue("grossWeight") as number;
      const weightInGrams = mgToGrams(weightInMg);
      return (
        <div className="font-medium text-center">
          {formatWeightGrams(weightInGrams)}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "sellingPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Unit Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const priceInPaise = row.getValue("sellingPrice") as number;
      return (
        <div className="font-medium text-center">
          {formatPriceRupees(priceInPaise)}
        </div>
      );
    },
    size: 120,
  },
  {
    id: "totalPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 font-semibold"
      >
        Total Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const priceInPaise = row.getValue("sellingPrice") as number;
      const quantity = row.getValue("quantity") as number;
      // Calculate total in paise: unit price * quantity
      const totalInPaise = priceInPaise * quantity;
      return (
        <div className="font-medium text-center">
          {formatPriceRupees(totalInPaise)}
        </div>
      );
    },
    size: 120,
  },
];
