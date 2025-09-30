import { z } from 'zod';

// Customer validation schemas
export const createCustomerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .refine((val) => {
      // Basic phone validation - adjust regex based on your requirements
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      return phoneRegex.test(val) && val.replace(/\D/g, '').length >= 10;
    }, 'Please enter a valid phone number'),
  email: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return z.string().email().safeParse(val).success;
    }, 'Please enter a valid email address'),
  address: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return val.length <= 500;
    }, 'Address must be less than 500 characters')
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Customer query validation
export const customerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['name', 'registrationDate', 'lastPurchase', 'totalSpent']).default('registrationDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Customer form validation for frontend
export const customerFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .refine((val) => {
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      return phoneRegex.test(val) && val.replace(/\D/g, '').length >= 10;
    }, 'Please enter a valid phone number'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal(''))
});

// Bulk delete validation
export const bulkDeleteCustomersSchema = z.object({
  ids: z.array(z.string().uuid('Invalid customer ID')).min(1, 'At least one customer ID is required')
});

export type CreateCustomerData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryParams = z.infer<typeof customerQuerySchema>;
export type CustomerFormData = z.infer<typeof customerFormSchema>;
export type BulkDeleteCustomersData = z.infer<typeof bulkDeleteCustomersSchema>;