// components/products/product-list-content.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/products/use-products';
import { useBrands } from '@/hooks/products/use-brands';
import { useCategories } from '@/hooks/products/use-categories';
import { useViewToggle } from '@/components/ui/view-toggle';
import { ProductHeader } from './product-header';
import { ProductFilters } from './product-filters';
import { ProductTable } from './product-table';
import { ProductGrid } from './product-grid';
import { ProductEmptyState } from './product-empty-state';
import { ProductBulkActions } from './product-bulk-actions';
import { ProductPagination } from './product-pagination';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProductGridSkeleton } from './product-list-skeleton';
import { ProductDataRow } from '@/lib/types/product';

export function ProductListContent() {
  const searchParams = useSearchParams();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { view, setView } = useViewToggle('products-view');

  // Parse URL parameters
  const filters = {
    q: searchParams.get('q') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    brandId: searchParams.get('brandId') || undefined,
    status: searchParams.get('status') || undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  };

  // Fetch data
  const { data: productsData, isLoading, error } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const handleBulkAction = (action: string) => {
    toast.success('Bulk action need to be done')
    setSelectedProducts([]);
  };

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-4 pt-6">
        <ProductEmptyState type="error" onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container max-w-7xl mx-auto p-4 pt-6 space-y-6">
        {/* Header */}
        <ProductHeader 
          totalCount={productsData?.totalCount || 0}
          isLoading={isLoading}
        />

        {/* Filters */}
        <ProductFilters 
            categories={categories?.categories || []}
            brands={brands?.brands || []}
            view={view}
            onViewChange={setView}
            isLoading={isLoading}
        />

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <ProductBulkActions 
            selectedCount={selectedProducts.length}
            onAction={handleBulkAction}
            onClear={() => setSelectedProducts([])}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <ProductGridSkeleton view={view} />
        ) : productsData?.products && productsData.products.length > 0 ? (
          <>
            {view === 'table' ? (
              <ProductTable 
                products={(productsData?.products || []) as ProductDataRow[]}
                selectedProducts={selectedProducts}
                onSelectionChange={setSelectedProducts}
              />
            ) : (
              <ProductGrid 
                products={(productsData?.products || []) as ProductDataRow[]}
                selectedProducts={selectedProducts}
                onSelectionChange={setSelectedProducts}
              />
            )}

            <ProductPagination 
              currentPage={filters.page}
              totalPages={Math.ceil((productsData?.totalCount || 0) / filters.limit)}
              totalItems={productsData?.totalCount || 0}
              itemsPerPage={filters.limit}
            />
          </>
        ) : (
          <ProductEmptyState type="empty" />
        )}

        {/* Floating Add Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link href="/products/product-list/add-products">
            <Button 
              size="lg" 
              className="rounded-full shadow-lg h-14 w-14"
              aria-label="Add new product"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}