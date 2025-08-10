import { suppliersApi } from "@/lib/api/products/suppliers";
import { CreateSupplierData, UpdateSupplierData } from "@/lib/types/products/suppliers";
import { QUERY_KEYS } from "@/lib/utils/products/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuppliers = (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    return useQuery({
        queryKey: QUERY_KEYS.suppliers.list(params),
        queryFn: () => suppliersApi.getSuppliers(params),
        staleTime: Infinity,
    })
}

export const useSupplier = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.suppliers.detail(id),
        queryFn: () => suppliersApi.getSupplier(id),
        enabled: !!id,
        staleTime: Infinity,
    })
}

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSupplierData) => suppliersApi.createSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all });
            toast.success('Supplier created successfully')
        },
        onError: (error: any) => {
           // handled in form
        },
    });
};

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSupplierData }) => 
            suppliersApi.updateSupplier(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all });
            toast.success("Supplier updated successfully");
        },
        onError: (error: any) => {
            // handled in form
        },
    })
}

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all });
      toast.success("Supplier deleted successfully");
    },
    onError: (error: any) => {
      toast(error.message || "Failed to delete supplier");
    },
  });
};