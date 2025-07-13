import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userManagementApi } from "@/lib/api/settings/user-management";
import { UserFilters, CreateUserRequest, UpdateUserRequest, InviteUserRequest, UserRole } from "@/lib/types/settings/user-management";

const USER_QUERY_KEY = 'users';

export function useUsers(filters?: UserFilters) {
    return useQuery({
        queryKey: [USER_QUERY_KEY, filters],
        queryFn: () => userManagementApi.getUsers(filters),
        staleTime: Infinity,
    })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, userId],
    queryFn: () => userManagementApi.getUser(userId),
    enabled: !!userId,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: [USER_QUERY_KEY, 'stats'],
    queryFn: () => userManagementApi.getUserStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => userManagementApi.createUser(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
            toast.success(`User ${data.name} created successfully`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create user');
        },
    });
}


export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      userManagementApi.updateUser(userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast.success(`User ${data.name} updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userManagementApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserRequest) => userManagementApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast.success('Invitation sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send invitation');
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userManagementApi.resendInvitation(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast.success('Invitation resent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to resend invitation');
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userManagementApi.toggleUserStatus(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast.success(`User ${data.active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to toggle user status');
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      userManagementApi.updateUserRole(userId, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      toast.success(`User role updated to ${data.role}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    },
  });
}