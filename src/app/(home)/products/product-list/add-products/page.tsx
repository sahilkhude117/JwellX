// src/app/products/product-list/add-products/page.tsx
'use client';

import React, { Suspense } from 'react';
import { ProductFormSkeleton } from '@/app/components/products/add-products/create-product-skeleton';
import { AddProductContent } from '@/app/components/products/add-products/add-product-content';

const AddProductsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ProductFormSkeleton />}>
        <AddProductContent />
      </Suspense>
    </div>
  );
};

export default AddProductsPage;