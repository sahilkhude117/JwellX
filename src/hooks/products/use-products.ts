import { productsApi } from "@/lib/api/products/products";
import { ProductFilters, ProductListResponse } from "@/lib/types/products/products";
import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (filters: ProductFilters) => [...PRODUCT_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
};

export const useProducts = (filters: ProductFilters, options?: UseQueryOptions<ProductListResponse>) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => productsApi.getProducts(filters),
    staleTime: Infinity,
    ...options,
  });
};

export const prefetchProducts = (filters: ProductFilters) => {
  const queryClient = useQueryClient();
  return queryClient.prefetchQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => productsApi.getProducts(filters),
  });
};
