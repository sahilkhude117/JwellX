import { CustomerQueryParams } from '@/lib/types/customers/customers';
import { useMemo, useState } from 'react';
import { useCustomers } from './use-customers';

export const useCustomerTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Partial<CustomerQueryParams>>({});

  const queryParams = useMemo(() => ({
    page,
    limit,
    ...filters,
  }), [page, limit, filters])

  const { data, isLoading, error } = useCustomers(queryParams);

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
    data: data?.customers || [],
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