import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '@/lib/api/products/categories';
import { CreateBrandData, UpdateBrandData } from '@/lib/types/products/categories';
import { toast } from '@/components/ui/use-toast';

export const useBrands = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandsApi.getBrands(params),
    staleTime: Infinity, 
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => brandsApi.getBrand(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBrandData) => brandsApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
    },
    onError: (error: any) => {
      //handled in form
    },
  });
}

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandData }) =>
      brandsApi.updateBrand(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', id] });
      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
    },
    onError: (error: any) => {
      // handled in form
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => brandsApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
    },
    onError: (error: any) => {
        toast({
            title: "Error",
            description: error.message || "Failed to delete brand",
            variant: "destructive",
        })
    },
  });
};
