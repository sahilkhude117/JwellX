import { api } from "@/lib/api";
import { ProductDetail, ProductFilters, ProductListResponse } from "@/lib/types/products/products";

export const productsApi = {
    getProducts: (filters: ProductFilters) => 
        api.get<ProductListResponse>(`/v1/products`, { params: filters }),
}