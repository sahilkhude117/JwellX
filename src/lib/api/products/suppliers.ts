import { api } from "@/lib/api";
import { SupplierResponse, SuppliersResponse, CreateSupplierData, UpdateSupplierData } from "@/lib/types/products/suppliers";

export const suppliersApi = {
    getSuppliers: (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        
        return api.get<SuppliersResponse>(`/v1/products/suppliers?${searchParams.toString()}`);
    },

    getSupplier: (id: string) =>
        api.get<SupplierResponse>(`/v1/products/suppliers/${id}`),

    createSupplier: (data: CreateSupplierData) =>
        api.post<SupplierResponse>('/v1/products/suppliers', data),

    updateSupplier: (id: string, data: UpdateSupplierData) =>
        api.patch<SupplierResponse>(`/v1/products/suppliers/${id}`, data),

    deleteSupplier: (id: string) =>
        api.delete(`/v1/products/suppliers/${id}`),
}