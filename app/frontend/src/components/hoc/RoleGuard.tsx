import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoute?: string;
}

/**
 * HOC to protect routes based on user roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRoute 
}) => {
  const { user, canAccessRoute } = useRole();
  const location = useLocation();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get route ID from current path or required route
  const routeId = requiredRoute || location.pathname.slice(1) || 'leaderboard';

  // Check if user can access this route
  if (!canAccessRoute(routeId)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
              <ShieldX className="w-8 h-8" />
            </div>
            <CardTitle className="text-white text-2xl">Access Denied</CardTitle>
            <p className="text-slate-400">
              You need administrator access to view this feature.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-500 text-sm">
              Connect with an administrator account to access this functionality.
            </p>
            <div className="mt-4 p-3 bg-slate-700 rounded-lg">
              <p className="text-slate-300 text-sm">
                <strong>Your role:</strong> {user.role}
              </p>
              <p className="text-slate-300 text-sm">
                <strong>Requested page:</strong> {routeId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard; 