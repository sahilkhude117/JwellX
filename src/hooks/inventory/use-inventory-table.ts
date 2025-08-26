import { InventoryQueryParams } from "@/lib/types/inventory/inventory";
import { useMemo, useState } from "react"
import { useInventoryItems } from "./use-inventory";

export const useInventoryTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState<Partial<InventoryQueryParams>>({});

    const queryParams = useMemo(() => ({
        page,
        limit,
        ...filters,
    }), [page, limit, filters])

    const { data, isLoading, error } = useInventoryItems(queryParams);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleFiltersChange = (newFilters: Record<string, any>) => {
        setFilters(newFilters);
        setPage(1);
    };

    return {
        data: data?.items || [],
        totalCount: data?.total || 0,
        currentPage: page,
        pageSize: limit,
        loading: isLoading,
        error,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onFiltersChange: handleFiltersChange,
    };
}