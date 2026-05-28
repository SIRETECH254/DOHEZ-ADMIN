import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook to generate initials from the current authenticated user.
 * @returns The user's initials or 'U' as a fallback.
 */
export const useInitial = () => {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return 'U'
    const initials = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((value) => value?.[0]?.toUpperCase())
      .join('')
    return initials || 'U'
  }, [user])
}
