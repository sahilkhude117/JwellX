import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { customersApi } from '@/lib/api/customers/customers';
import {
  CustomersResponse,
  CustomerResponse,
  CustomerQueryParams,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerStatsApiResponse,
  CustomerStatsParams
} from '@/lib/types/customers/customers';
import { CUSTOMER_QUERY_KEYS } from './customer-query-keys';

// Get customers list
export const useCustomers = (params?: CustomerQueryParams) => {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.customers.list(params),
    queryFn: () => customersApi.getCustomers(params),
    staleTime: Infinity
  });
};

// Get single customer
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.customers.detail(id),
    queryFn: () => customersApi.getCustomer(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

// Get customer statistics
export const useCustomerStats = (
  params?: CustomerStatsParams,
  options?: {
    staleTime?: number;
    refetchInterval?: number;
    enabled?: boolean;
  }
): UseQueryResult<CustomerStatsApiResponse, Error> => {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.customers.statsWithParams(params),
    queryFn: () => customersApi.getCustomerStats(params),
    staleTime: options?.staleTime ?? 24 * 60 * 60 * 1000, // 24 hours
    refetchInterval: options?.refetchInterval ?? false,
    enabled: options?.enabled ?? true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Get customer lookups
export const useCustomerLookups = () => {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.customers.lookups(),
    queryFn: () => customersApi.getCustomerLookups(),
    staleTime: Infinity,
  });
};

// Create customer mutation
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customersApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.customers.all });
      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create customer',
        variant: 'destructive',
      });
    },
  })
}

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerData }) =>
      customersApi.updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.customers.all });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.customers.detail(id) });
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update customer',
        variant: 'destructive',
      });
    },
  });
};

// Delete customer mutation
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.customers.all });
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete customer',
        variant: 'destructive',
      });
    },
  });
};

// Bulk delete customers mutation
export const useBulkDeleteCustomers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => customersApi.bulkDelete(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.customers.all });
      toast({
        title: 'Success',
        description: response.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete customers',
        variant: 'destructive',
      });
    },
  });
};