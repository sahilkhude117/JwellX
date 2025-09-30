import { api } from "@/lib/api";
import { UserOption, UserLookupResponse } from "@/lib/types/users/user";

export const usersApi = {
  // Lookup data methods
  getUsers: () =>
    api.get<{ users: UserOption[] }>(`/v1/users/lookup`),
};