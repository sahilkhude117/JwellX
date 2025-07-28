import { categoriesApi } from "@/lib/api/products/categories";
import { CreateCategoryData, UpdateCategoryData } from "@/lib/types/products/categories";
import { QUERY_KEYS } from "@/lib/utils/products/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCategories = (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    return useQuery({
        queryKey: QUERY_KEYS.categories.list(params),
        queryFn: () => categoriesApi.getCategories(params),
        staleTime: Infinity,
    })
}

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.categories.detail(id),
        queryFn: () => categoriesApi.getCategory(id),
        enabled: !!id,
        staleTime: Infinity,
    })
}

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryData) => categoriesApi.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
            toast.success('Category created successfully')
        },
        onError: (error: any) => {
           // handled in form
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) => 
            categoriesApi.updateCategory(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
            toast.success("Category updated successfully");
        },
        onError: (error: any) => {
            // handled in form
        },
    })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to delete category");
    },
  });
};