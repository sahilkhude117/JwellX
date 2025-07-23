import { ProductListContent } from "@/app/components/products/product-list-content";
import { ProductListSkeleton } from "@/app/components/products/product-list-skeleton";
import { Suspense } from "react";

export default function ProductListPage() {
    return (
        <Suspense fallback={<ProductListSkeleton />}>
            <ProductListContent />
        </Suspense>
    )
}