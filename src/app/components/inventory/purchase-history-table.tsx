// components/inventory/purchase-history-table.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { PurchaseLogRowData } from "@/lib/types/inventory";

interface PurchaseHistoryTableProps {
  data: PurchaseLogRowData[];
  onViewDetails: (purchase: PurchaseLogRowData) => void;
  onEdit: (purchase: PurchaseLogRowData) => void;
  onDelete: (purchaseId: string) => void;
  onExport: () => void;
}

export function PurchaseHistoryTable({ 
  data, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onExport 
}: PurchaseHistoryTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedPurchase, setSelectedPurchase] = React.useState<PurchaseLogRowData | null>(null);

  const handleDeleteClick = (purchase: PurchaseLogRowData) => {
    setSelectedPurchase(purchase);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPurchase) {
      onDelete(selectedPurchase.id);
      setDeleteDialogOpen(false);
      setSelectedPurchase(null);
    }
  };

  return (
    <>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Reference #</TableHead>
              <TableHead className="text-right">Items Purchased</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="w-16">
                <Button variant="ghost" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No purchase records found. Click "Log New Purchase" to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    {format(new Date(purchase.purchaseDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {purchase.supplier.name}
                  </TableCell>
                  <TableCell>
                    {purchase.referenceNumber || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {purchase.totalItems} items
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{purchase.totalCost.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetails(purchase)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(purchase)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(purchase)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase record
              {selectedPurchase && ` from ${selectedPurchase.supplier.name}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}