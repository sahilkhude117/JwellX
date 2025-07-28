import { gemstonesApi } from "@/lib/api/products/materials";
import { CreateGemstoneData, UpdateGemstoneData } from "@/lib/types/products/materials";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../use-toast";
import { QUERY_KEYS } from "@/lib/utils/products/query-keys";

export const useGemstones = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  shape?: string;
}) => {
  return useQuery({
    queryKey: QUERY_KEYS.gemstones.list(params),
    queryFn: () => gemstonesApi.getGemstones(params),
    staleTime: Infinity, 
  });
};

export const useGemstone = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.gemstones.detail(id),
    queryFn: () => gemstonesApi.getGemstone(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export const useCreateGemstone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateGemstoneData) => gemstonesApi.createGemstone(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gemstones.all });
      toast({
        title: "Success",
        description: response.message || "Gemstone created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create gemstone",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateGemstone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGemstoneData }) =>
      gemstonesApi.updateGemstone(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gemstones.all });
      toast({
        title: "Success",
        description: response.message || "Gemstone updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update gemstone",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteGemstone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => gemstonesApi.deleteGemstone(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gemstones.all });
      toast({
        title: "Success",
        description: response.message || "Gemstone deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete gemstone",
        variant: "destructive",
      });
    },
  });
};