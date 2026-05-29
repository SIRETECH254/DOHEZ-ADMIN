import { useMemo } from 'react'

interface IUserNames {
  firstName?: string;
  lastName?: string;
}

/**
 * Helper to generate initials from a user object or names.
 * @param user - Object containing firstName and lastName.
 * @returns The user's initials or 'U' as a fallback.
 */
export const getInitials = (user?: IUserNames) => {
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((value) => value?.[0]?.toUpperCase())
    .join('')
  return initials || 'U'
}

/**
 * Hook to generate initials from a user object.
 * @param user - Object containing firstName and lastName.
 * @returns The user's initials or 'U' as a fallback.
 */
export const useInitials = (user?: IUserNames) => {
  return useMemo(() => getInitials(user), [user?.firstName, user?.lastName])
}
