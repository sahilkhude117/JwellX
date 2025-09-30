import { StockAdjustmentQueryParams } from "@/lib/types/inventory/inventory";
import { useMemo, useState } from "react"
import { useStockAdjustments } from "./use-inventory";
import { DateRange } from "react-day-picker";

interface ExtendedFilters extends Partial<StockAdjustmentQueryParams> {
    dateRange?: DateRange;
}

export const useStockAdjustmentTable = (refreshKey?: number) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState<ExtendedFilters>({});
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const queryParams = useMemo(() => {
        const { dateRange, ...otherFilters } = filters;
        
        return {
            page,
            limit,
            ...otherFilters,
            // Convert dateRange to startDate and endDate
            ...(dateRange?.from && {
                startDate: dateRange.from.toISOString().split('T')[0],
            }),
            ...(dateRange?.to && {
                endDate: dateRange.to.toISOString().split('T')[0],
            }),
        };
    }, [page, limit, filters, refreshKey]);

    const { data, isLoading, error, refetch } = useStockAdjustments(queryParams);

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

    const refresh = async () => {
        await refetch();
        setLastUpdated(new Date());
    };

    // Set initial last updated time
    useMemo(() => {
        if (data && !lastUpdated) {
            setLastUpdated(new Date());
        }
    }, [data, lastUpdated]);

    return {
        data: data?.adjustments || [],
        totalCount: data?.total || 0,
        currentPage: page,
        pageSize: limit,
        loading: isLoading,
        error,
        lastUpdated,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onFiltersChange: handleFiltersChange,
        refresh,
    };
}