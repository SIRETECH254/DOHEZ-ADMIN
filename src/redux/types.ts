// Redux State Types
// Re-export API types for consistency with API responses

import type { IUser, IRole, IVendor, IBranch } from '../types/api.types';

export type User = IUser;
export type Role = IRole;
export type Vendor = IVendor;
export type Branch = IBranch;

export interface AuthState {
  user: User | null;
  roles: Role[] | null;
  vendor: Vendor | null;
  branch: Branch | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}
