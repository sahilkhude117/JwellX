// components/inventory/purchase-details-dialog.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { PurchaseLogRowData } from "@/lib/types/inventory";
import { mockProductVariants } from "@/lib/mock/inventory";

interface PurchaseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: PurchaseLogRowData | null;
}

// Mock detailed purchase data - in real app this would come from API
const mockPurchaseDetails = {
  pur_1: [
    { productVariantId: 'pv_1', sku: 'GOLD-RING-001', productName: 'Gold Ring 18K - Size 7', quantity: 5, unitCost: 15000 },
    { productVariantId: 'pv_2', sku: 'GOLD-NECKLACE-002', productName: 'Gold Necklace 22K - 16 inch', quantity: 3, unitCost: 45000 },
    { productVariantId: 'pv_3', sku: 'DIAMOND-EARRING-003', productName: 'Diamond Earrings 1ct - Stud', quantity: 7, unitCost: 12500 },
  ],
  pur_2: [
    { productVariantId: 'pv_4', sku: 'SILVER-BRACELET-004', productName: 'Silver Bracelet 925 - Chain', quantity: 3, unitCost: 226667 },
  ],
  pur_3: [
    { productVariantId: 'pv_5', sku: 'EMERALD-PENDANT-005', productName: 'Emerald Pendant 2ct - Oval', quantity: 8, unitCost: 52500 },
  ],
};

export function PurchaseDetailsDialog({ 
  open, 
  onOpenChange, 
  purchase 
}: PurchaseDetailsDialogProps) {
  if (!purchase) return null;

  const items = mockPurchaseDetails[purchase.id as keyof typeof mockPurchaseDetails] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Purchase Details</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Purchase Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                <p className="text-lg font-semibold">
                  {format(new Date(purchase.purchaseDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-lg font-semibold">{purchase.supplier.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                <p className="text-lg font-semibold">
                  {purchase.referenceNumber || "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                <p className="text-2xl font-bold text-green-600">
                  ₹{purchase.totalCost.toLocaleString('en-IN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.sku}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{item.unitCost.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{(item.quantity * item.unitCost).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell colSpan={4} className="text-right font-semibold">
                        Grand Total:
                      </TableCell>
                      <TableCell className="text-right text-lg font-bold">
                        ₹{purchase.totalCost.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
