
export interface User {
  id: string;
  username: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: Date | null;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
  shopId: string;
}

export type UserRole = 'OWNER' | 'SALES_STAFF' | 'ARTISAN' | 'ACCOUNTANT';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  username: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
  username?: string;
}

export interface InviteUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export interface UserWithShop extends User {
  shop: {
    id: string;
    name: string;
  };
}

export interface PaginatedUsers {
  users: UserWithShop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}