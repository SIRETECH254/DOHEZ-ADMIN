import type { IRole } from '../types/api.types';

export const ROLE_LEVELS = {
  super_admin: 100,
  admin: 80,
  vendor_admin: 60,
  branch_admin: 40,
  staff: 20,
} as const;

export type RoleName = keyof typeof ROLE_LEVELS;

/**
 * Checks if the user has access to a resource based on their roles and the required minimum role.
 * @param userRoles - The roles assigned to the user.
 * @param minRole - The minimum role required for access.
 * @returns true if access is granted, false otherwise.
 */
export const hasAccess = (userRoles: IRole[] | null, minRole?: string): boolean => {
  if (!minRole) return true;

  if (!userRoles || userRoles.length === 0) return false;

  const requiredLevel = ROLE_LEVELS[minRole as RoleName] || 0;
  
  // Find the highest level among the user's roles
  const userMaxLevel = Math.max(
    ...userRoles.map((role) => ROLE_LEVELS[role.name as RoleName] || 0)
  );

  return userMaxLevel >= requiredLevel;
};
