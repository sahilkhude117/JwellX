// src/lib/api/products/products.ts
import { api } from "@/lib/api";
import { 
    ProductDetail, 
    ProductFilters, 
    ProductListResponse 
} from "@/lib/types/products/products";
import { 
    CreateProductInput,
    CreateProductResponse,
    CategoryOption,
    BrandOption,
    MaterialOption,
    GemstoneOption
} from "@/lib/types/products/create-products";

export const productsApi = {
    // Existing methods
    getProducts: (filters: ProductFilters) =>
        api.get<ProductListResponse>(`/v1/products`, { params: filters }),

    // New methods
    createProduct: (data: CreateProductInput) =>
        api.post<CreateProductResponse>(`/v1/products`, data),

    // Lookup data methods
    getCategories: () =>
        api.get<{ categories: CategoryOption[] }>(`/v1/products/lookup/categories`),

    getBrands: () =>
        api.get<{ brands: BrandOption[] }>(`/v1/products/lookup/brands`),

    getMaterials: () =>
        api.get<{ materials: MaterialOption[] }>(`/v1/products/lookup/materials`),

    getGemstones: () =>
        api.get<{ gemstones: GemstoneOption[] }>(`/v1/products/lookup/gemstones`),
};