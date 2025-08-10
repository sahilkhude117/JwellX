"use client";

import { useState, Suspense } from "react";
import { Plus, Search, LayoutGrid, List, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { DataPagination } from "@/app/components/Pagination";

import { useSuppliers } from "@/hooks/products/use-suppliers";

import SupplierFormDialog from "@/app/components/products/suppliers/supplier-form-dialog";
import SupplierCard from "@/app/components/products/suppliers/supplier-card";
import { SuppliersSkeleton } from "@/app/components/products/suppliers/skeletons/supplier-skeleton";

function SuppliersContent() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierLimit, setSupplierLimit] = useState(10);

  const {
    data: suppliersData,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers({ page: supplierPage, limit: supplierLimit, search });

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your suppliers and purchase history
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setIsSupplierDialogOpen(true)} className="bg-black">
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </div>

        {/* Content */}
        {suppliersError ? (
          <Alert>
            <AlertDescription>Failed to load suppliers. Please try again later.</AlertDescription>
          </Alert>
        ) : suppliersLoading ? (
          <SuppliersSkeleton />
        ) : !suppliersData?.suppliers?.length ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {search ? `No suppliers match "${search}"` : "Get started by creating your first supplier"}
            </p>
            <Button onClick={() => setIsSupplierDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Supplier
            </Button>
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"}`}>
              {suppliersData.suppliers.map((s) => (
                <SupplierCard key={s.id} supplier={s} />
              ))}
            </div>
            <DataPagination
              page={supplierPage}
              limit={supplierLimit}
              total={suppliersData.total}
              onPageChange={setSupplierPage}
              onLimitChange={setSupplierLimit}
            />
          </>
        )}

        {/* Dialogs */}
        <SupplierFormDialog
          isOpen={isSupplierDialogOpen}
          onClose={() => setIsSupplierDialogOpen(false)}
          mode="create"
        />
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={<SuppliersSkeleton />}>
      <SuppliersContent />
    </Suspense>
  );
}