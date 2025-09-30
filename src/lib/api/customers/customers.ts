import { api } from '@/lib/api';
import {
  CustomersResponse,
  CustomerResponse,
  CustomerQueryParams,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerStatsParams,
  CustomerStatsApiResponse,
  BulkDeleteCustomersResponse,
  CustomerLookups
} from '@/lib/types/customers/customers';

export const customersApi = {
  // Get paginated customers list
  getCustomers: (params?: CustomerQueryParams) => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.isActive !== undefined) {
      searchParams.append('isActive', params.isActive.toString());
    }
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return api.get<CustomersResponse>(`/v1/customers?${searchParams.toString()}`);
  },

  // Get single customer by ID
  getCustomer: (id: string) =>
    api.get<CustomerResponse>(`/v1/customers/${id}`),

  // Create new customer
  createCustomer: (data: CreateCustomerData) => 
    api.post<CustomerResponse>(`/v1/customers`, data),

  // Update existing customer
  updateCustomer: (id: string, data: UpdateCustomerData) =>
    api.patch<CustomerResponse>(`/v1/customers/${id}`, data),

  // Delete single customer
  deleteCustomer: (id: string) =>
    api.delete(`/v1/customers/${id}`),

  // Bulk delete customers
  bulkDelete: (ids: string[]) =>
    api.delete<BulkDeleteCustomersResponse>('/v1/customers/bulk', undefined, { ids }),

  // Get customer statistics
  getCustomerStats: (params?: CustomerStatsParams): Promise<CustomerStatsApiResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.timePeriod) {
      searchParams.append('timePeriod', params.timePeriod);
    }

    if (params?.startDate) {
      searchParams.append('startDate', params.startDate);
    }

    if (params?.endDate) {
      searchParams.append('endDate', params.endDate);
    }

    return api.get<CustomerStatsApiResponse>(`/v1/customers/stats?${searchParams.toString()}`);
  },

  // Get lookup data for filters and forms
  getCustomerLookups: (): Promise<CustomerLookups> => {
    return Promise.resolve({
      sortOptions: [
        { label: 'Name', value: 'name' },
        { label: 'Registration Date', value: 'registrationDate' },
        { label: 'Last Purchase', value: 'lastPurchase' },
        { label: 'Total Spent', value: 'totalSpent' }
      ],
      activityOptions: [
        { label: 'All Customers', value: 'all' },
        { label: 'Active Customers', value: 'true' },
        { label: 'Inactive Customers', value: 'false' }
      ]
    });
  },

  // Export customers data
  exportCustomers: (params?: CustomerQueryParams) => {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.append('search', params.search);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.isActive !== undefined) {
      searchParams.append('isActive', params.isActive.toString());
    }
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    // Add export flag
    searchParams.append('export', 'true');

    return api.get(`/v1/customers/export?${searchParams.toString()}`, {
      responseType: 'blob'
    });
  }
};