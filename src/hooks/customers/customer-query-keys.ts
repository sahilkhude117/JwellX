import { CustomerQueryParams, CustomerStatsParams } from '@/lib/types/customers/customers';

export const CUSTOMER_QUERY_KEYS = {
  customers: {
    all: ['customers'] as const,
    lists: () => [...CUSTOMER_QUERY_KEYS.customers.all, 'list'] as const,
    list: (params?: CustomerQueryParams) => [
      ...CUSTOMER_QUERY_KEYS.customers.lists(),
      { params }
    ] as const,
    details: () => [...CUSTOMER_QUERY_KEYS.customers.all, 'detail'] as const,
    detail: (id: string) => [...CUSTOMER_QUERY_KEYS.customers.details(), id] as const,
    stats: () => [...CUSTOMER_QUERY_KEYS.customers.all, 'stats'] as const,
    statsWithParams: (params?: CustomerStatsParams) => [
      ...CUSTOMER_QUERY_KEYS.customers.stats(),
      { params }
    ] as const,
    purchaseHistory: (customerId: string) => [
      ...CUSTOMER_QUERY_KEYS.customers.all,
      'purchase-history',
      customerId
    ] as const,
    lookups: () => [...CUSTOMER_QUERY_KEYS.customers.all, 'lookups'] as const,
  },
} as const;