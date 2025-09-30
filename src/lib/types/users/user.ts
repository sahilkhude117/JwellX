export interface UserOption {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface UserLookupResponse {
  users: UserOption[];
}