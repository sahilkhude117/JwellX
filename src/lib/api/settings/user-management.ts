import { api } from "@/lib/api";
import { CreateUserRequest, InviteUserRequest, PaginatedUsers, UpdateUserRequest, UserFilters, UserRole, UserWithShop } from "@/lib/types/settings/user-management";

export const userManagementApi = {
    getUsers: (filters?: UserFilters) => {
        const params = new URLSearchParams();
        if (filters?.role) params.append('role', filters.role);
        if (filters?.active !== undefined) params.append('active', filters.active.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        return api.get<PaginatedUsers>(`/v1/users?${params.toString()}`);
    },

    getUser: (userId: string) =>
        api.get<UserWithShop>(`/v1/users/${userId}`),

    createUser: (data: CreateUserRequest) => 
        api.post<UserWithShop>('/v1/users', data),

    updateUser: (userId: string, data: UpdateUserRequest) =>
        api.patch<UserWithShop>(`/v1/users/${userId}`, data),

    deleteUser: (userId: string) => 
        api.delete(`/v1/users/${userId}`),

    inviteUser: (data: InviteUserRequest) =>
        api.post<{ message: string; userId: string }>(`/v1/users/invite`, data),

    resendInvitation: (userId: string) =>
        api.post<{ message: string }>(`/v1/users/${userId}/resend-invitation`),

    toggleUserStatus: (userId: string) =>
        api.patch<UserWithShop>(`/v1/users/${userId}/toggle-status`),

    updateUserRole: (userId: string, role: UserRole) =>
        api.patch<UserWithShop>(`/v1/users/${userId}/role`, { role }),

    getUserStats: () =>
        api.get<{
            total: number;
            active: number;
            inactive: number;
            pendingInvites: number;
            byRole: Record<UserRole, number>;
        }>(`/v1/users/stats`),
}