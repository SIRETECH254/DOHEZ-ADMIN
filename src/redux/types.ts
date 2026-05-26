// Redux State Types
// Re-export API types for consistency with API responses

import type { IUser, IRole } from '../types/api.types';

export type User = IUser;
export type Role = IRole;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}
