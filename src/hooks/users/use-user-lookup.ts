import { usersApi } from "@/lib/api/users/user";
import { UserOption } from "@/lib/types/users/user";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const USER_LOOKUP_KEYS = {
  users: () => ['users', 'lookup'] as const,
};

export const useUsers = (options?: UseQueryOptions<{ users: UserOption[] }>) => {
  return useQuery({
    queryKey: USER_LOOKUP_KEYS.users(),
    queryFn: usersApi.getUsers,
    staleTime: Infinity,
    ...options,
  });
};