"use client";

import { useState, Suspense } from "react";
import { Plus, Search, LayoutGrid, List, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { DataPagination } from "@/app/components/Pagination";

import { useBrands } from "@/hooks/products/use-brands";
import { useCategories } from "@/hooks/products/use-categories";

import CategoryFormDialog from "@/app/components/products/categories/category-form-dialog";
import BrandFormDialog    from "@/app/components/products/categories/brand-form-dialog";
import CategoryCard       from "@/app/components/products/categories/category-card";
import BrandCard          from "@/app/components/products/categories/brand-card";
import { BrandsSkeleton, CategoriesSkeleton } from "@/app/components/products/categories/skeletons/categories";

function CategoriesContent() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);

  const [categoryPage, setCategoryPage]   = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(10);
  const [brandPage, setBrandPage]         = useState(1);
  const [brandLimit, setBrandLimit]       = useState(10);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories({ page: categoryPage, limit: categoryLimit, search });

  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
  } = useBrands({ page: brandPage, limit: brandLimit, search });

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your product categories and brands
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories or brands..."
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
            <Button onClick={() => setIsCategoryDialogOpen(true)} className="bg-black">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
            <Button onClick={() => setIsBrandDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              Brands
            </TabsTrigger>
          </TabsList>

          {/* ---------- CATEGORIES ---------- */}
          <TabsContent value="categories" className="mt-6">
            {categoriesError ? (
              <Alert>
                <AlertDescription>Failed to load categories. Please try again later.</AlertDescription>
              </Alert>
            ) : categoriesLoading ? (
              <CategoriesSkeleton />
            ) : !categoriesData?.categories?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {search ? `No categories match "${search}"` : "Get started by creating your first category"}
                </p>
                <Button onClick={() => setIsCategoryDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"}`}>
                  {categoriesData.categories.map((c) => (
                    <CategoryCard key={c.id} category={c} />
                  ))}
                </div>
                <DataPagination
                  page={categoryPage}
                  limit={categoryLimit}
                  total={categoriesData.total}
                  onPageChange={setCategoryPage}
                  onLimitChange={setCategoryLimit}
                />
              </>
            )}
          </TabsContent>

          {/* ---------- BRANDS ---------- */}
          <TabsContent value="brands" className="mt-6">
            {brandsError ? (
              <Alert>
                <AlertDescription>Failed to load brands. Please try again later.</AlertDescription>
              </Alert>
            ) : brandsLoading ? (
              <BrandsSkeleton />
            ) : !brandsData?.brands?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {search ? `No brands match "${search}"` : "Get started by creating your first brand"}
                </p>
                <Button onClick={() => setIsBrandDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Brand
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"}`}>
                  {brandsData.brands.map((b) => (
                    <BrandCard key={b.id} brand={b} />
                  ))}
                </div>
                <DataPagination
                  page={brandPage}
                  limit={brandLimit}
                  total={brandsData.total}
                  onPageChange={setBrandPage}
                  onLimitChange={setBrandLimit}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CategoryFormDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        mode="create"
      />
      <BrandFormDialog
        isOpen={isBrandDialogOpen}
        onClose={() => setIsBrandDialogOpen(false)}
        mode="create"
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}