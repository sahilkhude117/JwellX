import { productsApi } from "@/lib/api/products/products";
import { BrandOption, CategoryOption, CreateProductInput, CreateProductResponse, GemstoneOption, MaterialOption, SupplierOption } from "@/lib/types/products/create-products";
import { ProductFilters, ProductListResponse } from "@/lib/types/products/products";
import { QUERY_KEYS } from "@/lib/utils/products/query-keys";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

// Update LOOKUP_KEYS to use unified system
const LOOKUP_KEYS = {
    categories: () => QUERY_KEYS.categories.lookup(),
    brands: () => QUERY_KEYS.brands.lookup(),
    materials: () => QUERY_KEYS.materials.lookup(),
    gemstones: () => QUERY_KEYS.gemstones.lookup(),
    suppliers: () => QUERY_KEYS.suppliers.lookup(),
};


export const useCategories = (options?: UseQueryOptions<{ categories: CategoryOption[] }>) => {
    return useQuery({
        queryKey: LOOKUP_KEYS.categories(),
        queryFn: productsApi.getCategories,
        staleTime: Infinity,
        ...options,
    });
};

export const useBrands = (options?: UseQueryOptions<{ brands: BrandOption[] }>) => {
    return useQuery({
        queryKey: LOOKUP_KEYS.brands(),
        queryFn: productsApi.getBrands,
        staleTime: Infinity,
        ...options,
    });
};

export const useMaterials = (options?: UseQueryOptions<{ materials: MaterialOption[] }>) => {
    return useQuery({
        queryKey: LOOKUP_KEYS.materials(),
        queryFn: productsApi.getMaterials,
        staleTime: Infinity,
        ...options,
    });
};

export const useGemstones = (options?: UseQueryOptions<{ gemstones: GemstoneOption[] }>) => {
    return useQuery({
        queryKey: LOOKUP_KEYS.gemstones(),
        queryFn: productsApi.getGemstones,
        staleTime: Infinity,
        ...options,
    });
};

export const useSuppliers = (options?: UseQueryOptions<{ suppliers: SupplierOption[] }>) => {
    return useQuery({
        queryKey: LOOKUP_KEYS.suppliers(),
        queryFn: productsApi.getSuppliers,
        staleTime: Infinity,
        ...options,
    })
}

export const usePrefetchLookupData = () => {
    const queryClient = useQueryClient();

    const prefetchCategories = () =>
        queryClient.prefetchQuery({
            queryKey: LOOKUP_KEYS.categories(),
            queryFn: productsApi.getCategories,
            staleTime: Infinity,
        });

    const prefetchBrands = () =>
        queryClient.prefetchQuery({
            queryKey: LOOKUP_KEYS.brands(),
            queryFn: productsApi.getBrands,
            staleTime: Infinity,
        });

    const prefetchMaterials = () =>
        queryClient.prefetchQuery({
            queryKey: LOOKUP_KEYS.materials(),
            queryFn: productsApi.getMaterials,
            staleTime: Infinity,
        });

    const prefetchGemstones = () =>
        queryClient.prefetchQuery({
            queryKey: LOOKUP_KEYS.gemstones(),
            queryFn: productsApi.getGemstones,
            staleTime: Infinity,
        });

    const prefetchSuppliers = () =>
        queryClient.prefetchQuery({
            queryKey: LOOKUP_KEYS.suppliers(),
            queryFn: productsApi.getSuppliers,
            staleTime: Infinity,
        });

    const prefetchAll = () => {
        prefetchCategories();
        prefetchBrands();
        prefetchMaterials();
        prefetchGemstones();
        prefetchSuppliers();
    };

    return {
        prefetchCategories,
        prefetchBrands,
        prefetchMaterials,
        prefetchGemstones,
        prefetchSuppliers,
        prefetchAll,
    };
};