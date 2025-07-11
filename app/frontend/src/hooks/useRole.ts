import { useAuthContext } from './useAuthContext';
import { UserRole, ROUTE_ACCESS } from '@/types/auth';

/**
 * Hook for role-based access control
 */
export const useRole = () => {
  const { user, hasRole, isAdmin, isUser } = useAuthContext();

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (routeId: string): boolean => {
    if (!user) return false;

    // Admin can access everything
    if (isAdmin()) return true;

    // User can only access user routes
    if (isUser()) {
      return ROUTE_ACCESS.user.includes(routeId as any);
    }

    return false;
  };

  /**
   * Get accessible routes for current user
   */
  const getAccessibleRoutes = (): string[] => {
    if (!user) return [];

    if (isAdmin()) {
      return [...ROUTE_ACCESS.admin, ...ROUTE_ACCESS.user];
    }

    if (isUser()) {
      return [...ROUTE_ACCESS.user];
    }

    return [];
  };

  /**
   * Check if user has specific role
   */
  const checkRole = (role: UserRole): boolean => {
    return hasRole(role);
  };

  return {
    user,
    canAccessRoute,
    getAccessibleRoutes,
    checkRole,
    isAdmin,
    isUser,
    hasRole
  };
}; 