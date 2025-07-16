import { api } from "@/lib/api";
import { BrandResponse, BrandsResponse, CategoriesResponse, CategoryResponse, CreateBrandData, CreateCategoryData, UpdateBrandData, UpdateCategoryData } from "@/lib/types/products/categories";

export const categoriesApi = {
    getCategories: (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);

        return api.get<CategoriesResponse>(`/v1/products/categories?${searchParams.toString()}`)
    },

    getCategory: (id: string) =>
        api.get<CategoryResponse>(`/v1/products/categories/${id}`),

    createCategory: (data: CreateCategoryData) =>
        api.post<CategoryResponse>(`/v1/products/categories`, data),

    updateCategory: (id: string, data: UpdateCategoryData) =>
        api.patch<CategoryResponse>(`/v1/products/categories/${id}`, data),

    deleteCategory: (id: string) =>
        api.delete(`/v1/products/categories/${id}`),
} 

export const brandsApi = {
    getBrands: (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        
        return api.get<BrandsResponse>(`/v1/products/brands?${searchParams.toString()}`);
    },

  getBrand: (id: string) =>
    api.get<BrandResponse>(`/v1/products/brands/${id}`),

  createBrand: (data: CreateBrandData) =>
    api.post<BrandResponse>('/v1/products/brands', data),

  updateBrand: (id: string, data: UpdateBrandData) =>
    api.patch<BrandResponse>(`/v1/products/brands/${id}`, data),

  deleteBrand: (id: string) =>
    api.delete(`/v1/products/brands/${id}`),
}