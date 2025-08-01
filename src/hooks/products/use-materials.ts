import { materialsApi } from "@/lib/api/products/materials";
import { CreateMaterialData, UpdateMaterialData } from "@/lib/types/products/materials";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../use-toast";
import { QUERY_KEYS } from "@/lib/utils/products/query-keys";

export const useMaterials = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}) => {
    return useQuery({
        queryKey: QUERY_KEYS.materials.list(params),
        queryFn: () => materialsApi.getMaterials(params),
        staleTime: Infinity
    });
};

export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.materials.detail(id),
    queryFn: () => materialsApi.getMaterial(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMaterialData) => materialsApi.createMaterial(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.materials.all });
      toast({
        title: "Success",
        description: response.message || "Material created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update material",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialData }) =>
      materialsApi.updateMaterial(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.materials.all });
      toast({
        title: "Success",
        description: response.message || "Materials updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update Materials",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => materialsApi.deleteMaterial(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.materials.all });
      toast({
        title: "Success",
        description: response.message || "Material deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete material",
        variant: "destructive",
      });
    },
  });
};