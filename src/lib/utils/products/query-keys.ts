export const QUERY_KEYS = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...QUERY_KEYS.products.all, 'list'] as const,
    list: (filters: any) => [...QUERY_KEYS.products.lists(), filters] as const,
    details: () => [...QUERY_KEYS.products.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.products.details(), id] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...QUERY_KEYS.categories.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.categories.lists(), params] as const,
    details: () => [...QUERY_KEYS.categories.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.categories.details(), id] as const,
    // For product lookup (simple list without pagination)
    lookup: () => [...QUERY_KEYS.categories.all, 'lookup'] as const,
  },
  
  // Brands
  brands: {
    all: ['brands'] as const,
    lists: () => [...QUERY_KEYS.brands.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.brands.lists(), params] as const,
    details: () => [...QUERY_KEYS.brands.all, 'detail'] as const,  
    detail: (id: string) => [...QUERY_KEYS.brands.details(), id] as const,
    // For product lookup (simple list without pagination)
    lookup: () => [...QUERY_KEYS.brands.all, 'lookup'] as const,
  },
  
  // Materials & Gemstones
  materials: {
    all: ['materials'] as const,
    lists: () => [...QUERY_KEYS.materials.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.materials.lists(), params] as const,
    details: () => [...QUERY_KEYS.materials.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.materials.details(), id] as const,
    lookup: () => [...QUERY_KEYS.materials.all, 'lookup'] as const,
  },
  
  // Gemstones - UPDATED
  gemstones: {
    all: ['gemstones'] as const,
    lists: () => [...QUERY_KEYS.gemstones.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.gemstones.lists(), params] as const,
    details: () => [...QUERY_KEYS.gemstones.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.gemstones.details(), id] as const,
    lookup: () => [...QUERY_KEYS.gemstones.all, 'lookup'] as const,
  },
  
  // Suppliers - NEW
  suppliers: {
    all: ['suppliers'] as const,
    lists: () => [...QUERY_KEYS.suppliers.all, 'list'] as const,
    list: (params?: any) => [...QUERY_KEYS.suppliers.lists(), params] as const,
    details: () => [...QUERY_KEYS.suppliers.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.suppliers.details(), id] as const,
    // For product lookup (simple list without pagination)
    lookup: () => [...QUERY_KEYS.suppliers.all, 'lookup'] as const,
  },
};