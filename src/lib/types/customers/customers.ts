import { Customer } from "@/generated/prisma";
import { BaseStat } from "../stats";

// Base Customer type from Prisma
export type BaseCustomer = Customer;

// Enhanced Customer with computed fields
export interface CustomerWithStats extends BaseCustomer {
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate: Date | null;
  isActive: boolean; // Has purchases in last 6 months
}

// API Request/Response Types
export interface CreateCustomerData {
  name: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerData {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

// API Response Types
export interface CustomerResponse {
  customer: CustomerWithStats;
}

export interface CustomersResponse {
  customers: CustomerWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query Parameters
export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'registrationDate' | 'lastPurchase' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
}

// Customer Statistics Types
export interface CustomerStatsData {
  current: number;
  chartData: Array<{
    value: number;
    timestamp: string;
    label: string;
  }>;
}

export interface CustomerStatsApiResponse {
  totalCustomers: CustomerStatsData;
  newCustomers: CustomerStatsData;
  totalSpend: CustomerStatsData;
  repeatCustomers: CustomerStatsData;
  lastUpdated: string | Date; // Can be string (HTTP) or Date (direct call)
  shopCreatedAt: string | Date; // Can be string (HTTP) or Date (direct call)
}

export interface CustomerStatsParams {
  timePeriod?: string;
  startDate?: string;
  endDate?: string;
}

// Customer Statistics for UI
export interface CustomerStat extends BaseStat {
  type: 'total-customers' | 'new-customers' | 'total-spend' | 'repeat-customers';
}

// Form Validation
export interface CustomerFormData {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
}

// Lookup types for filters
export interface CustomerLookups {
  sortOptions: Array<{ label: string; value: string }>;
  activityOptions: Array<{ label: string; value: string }>;
}

// Delete operation types
export interface BulkDeleteCustomersData {
  ids: string[];
}

export interface BulkDeleteCustomersResponse {
  message: string;
  deletedCount: number;
}