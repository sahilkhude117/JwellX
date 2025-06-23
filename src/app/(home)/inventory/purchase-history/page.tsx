
"use client";

import * as React from "react";
import { useState } from "react";
import { Plus, Filter, CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { LogNewPurchaseDialog } from "@/app/components/inventory/log-new-purchase-dialog";
import { PurchaseHistoryTable } from "@/app/components/inventory/purchase-history-table";
import { PurchaseDetailsDialog } from "@/app/components/inventory/purchase-details-dialog";

import { mockPurchaseHistory, mockSuppliers } from "@/lib/mock/inventory";
import type { PurchaseLogRowData } from "@/lib/types/inventory";

export default function PurchaseHistoryPage() {
  const [purchaseData, setPurchaseData] = useState<PurchaseLogRowData[]>(mockPurchaseHistory);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseLogRowData | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    return purchaseData.filter((purchase) => {
      const supplierMatch = selectedSupplier === "all" || purchase.supplier.id === selectedSupplier;
      const dateFromMatch = !dateFrom || new Date(purchase.purchaseDate) >= dateFrom;
      const dateToMatch = !dateTo || new Date(purchase.purchaseDate) <= dateTo;
      
      return supplierMatch && dateFromMatch && dateToMatch;
    });
  }, [purchaseData, selectedSupplier, dateFrom, dateTo]);

  const handleNewPurchase = (data: any) => {
    const supplier = mockSuppliers.find(s => s.id === data.supplierId);
    if (!supplier) return;

    const newPurchase: PurchaseLogRowData = {
      id: `pur_${Date.now()}`,
      purchaseDate: data.purchaseDate.toISOString(),
      supplier,
      referenceNumber: data.referenceNumber,
      totalItems: data.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      totalCost: data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0),
    };

    setPurchaseData(prev => [newPurchase, ...prev]);
  };

  const handleViewDetails = (purchase: PurchaseLogRowData) => {
    setSelectedPurchase(purchase);
    setDetailsDialogOpen(true);
  };

  const handleEdit = (purchase: PurchaseLogRowData) => {
    // In a real app, this would open the edit dialog
    console.log("Edit purchase:", purchase);
  };

  const handleDelete = (purchaseId: string) => {
    setPurchaseData(prev => prev.filter(p => p.id !== purchaseId));
  };

  const handleExport = () => {
    // In a real app, this would export to CSV/Excel
    console.log("Exporting purchase history...");
  };

  const clearFilters = () => {
    setSelectedSupplier("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <div className="flex flex-col border bg-background rounded-lg p-4 sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Inventory Purchase History</h1>
          <p className="text-muted-foreground">Track and manage all your inventory purchases from suppliers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
            Log New Purchase
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="grid gap-4 md:grid-cols-4 md:flex-1">
              <div className="space-y-2">
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="All suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All suppliers</SelectItem>
                    {mockSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <DatePicker
                  date={dateFrom}
                  onDateChange={setDateFrom}
                  placeholder="Start date"
                />
              </div>
              
              <div className="space-y-2">
                <DatePicker
                  date={dateTo}
                  onDateChange={setDateTo}
                  placeholder="End date"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History Table */}
      <Card className="mt-6">
        <CardContent>
          <PurchaseHistoryTable
            data={filteredData}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        </CardContent>
      </Card>

      {/* Mobile Cards View - Hidden on desktop */}
      <div className="md:hidden space-y-4">
        {filteredData.map((purchase) => (
          <Card key={purchase.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{purchase.supplier.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(purchase.purchaseDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <p className="font-semibold text-lg">
                  ₹{purchase.totalCost.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>{purchase.totalItems} items</span>
                <span className="text-muted-foreground">
                  {purchase.referenceNumber || "No ref."}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log New Purchase Dialog */}
      <LogNewPurchaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleNewPurchase}
      />

      {/* Purchase Details Dialog */}
      <PurchaseDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        purchase={selectedPurchase}
      />

      {/* Summary Stats */}
      {filteredData.length > 0 && (
        <div className="grid gap-4 mt-6 md:grid-cols-3">
          <Card>
            <CardContent className="">
              <div className="text-2xl font-bold">
                {filteredData.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Purchases
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="">
              <div className="text-2xl font-bold">
                {filteredData.reduce((sum, p) => sum + p.totalItems, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Items Purchased
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="">
              <div className="text-2xl font-bold">
                ₹{filteredData.reduce((sum, p) => sum + p.totalCost, 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Amount Spent
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}