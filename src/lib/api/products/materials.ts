import { api } from "@/lib/api";
import { ApiResponse, CreateGemstoneData, CreateMaterialData, Gemstone, Material, PaginatedResponse, UpdateGemstoneData, UpdateMaterialData } from "@/lib/types/products/materials";

export const materialsApi = {
    getMaterials: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());
        if (params?.search) searchParams.append("search", params.search);
        if (params?.type) searchParams.append("type", params.type);

        return api.get<PaginatedResponse<Material>>(`/v1/products/materials?${searchParams}`);
    },

    getMaterial: (id: string) =>
        api.get<ApiResponse<Material>>(`/v1/products/materials/${id}`),

    createMaterial: (data: CreateMaterialData) =>
        api.post<ApiResponse<Material>>(`/v1/products/materials`, data),

    updateMaterial: (id: string, data: UpdateMaterialData) =>
        api.patch<ApiResponse<Material>>(`/v1/products/materials/${id}`, data),

    deleteMaterial: (id: string) =>
        api.delete<ApiResponse<void>>(`/v1/products/materials/${id}`),
}

export const gemstonesApi = {
  // Get all gemstones with pagination and filters
  getGemstones: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    shape?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.shape) searchParams.append("shape", params.shape);
    
    return api.get<PaginatedResponse<Gemstone>>(`/v1/products/gemstones?${searchParams}`);
  },

  // Get single gemstone by ID
  getGemstone: (id: string) =>
    api.get<ApiResponse<Gemstone>>(`/v1/products/gemstones/${id}`),

  // Create new gemstone
  createGemstone: (data: CreateGemstoneData) =>
    api.post<ApiResponse<Gemstone>>("/v1/products/gemstones", data),

  // Update gemstone
  updateGemstone: (id: string, data: UpdateGemstoneData) =>
    api.patch<ApiResponse<Gemstone>>(`/v1/products/gemstones/${id}`, data),

  // Delete gemstone
  deleteGemstone: (id: string) =>
    api.delete<ApiResponse<void>>(`/v1/products/gemstones/${id}`),
};