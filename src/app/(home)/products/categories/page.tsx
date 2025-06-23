'use client';

import { AttributeManager } from '@/app/components/products/categories/attribute-manager';
import { useAttributes } from '@/hooks/use-attributes';
import { mockCategories, mockBrands } from '@/lib/mock/categories';

export default function ProductAttributesPage() {
  const {
    data: categories,
    isLoading: categoriesLoading,
    addItem: addCategory,
    editItem: editCategory,
    deleteItem: deleteCategory,
  } = useAttributes(mockCategories);

  const {
    data: brands,
    isLoading: brandsLoading,
    addItem: addBrand,
    editItem: editBrand,
    deleteItem: deleteBrand,
  } = useAttributes(mockBrands);

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">Product Attributes Management</h1>
          <p className="text-muted-foreground">Manage the categories and brands used to organize your products.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <AttributeManager
          title="Product Categories"
          data={categories}
          onAddItem={addCategory}
          onEditItem={editCategory}
          onDeleteItem={deleteCategory}
          isLoading={categoriesLoading}
        />

        <AttributeManager
          title="Product Brands"
          data={brands}
          onAddItem={addBrand}
          onEditItem={editBrand}
          onDeleteItem={deleteBrand}
          isLoading={brandsLoading}
        />
      </div>
    </div>
  );
}