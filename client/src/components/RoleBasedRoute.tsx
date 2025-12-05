import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleBasedRoute({ children, allowedRoles, redirectTo = '/barber-dashboard' }: RoleBasedRouteProps) {
  const { user } = useAuth();
  
  // If user is not authenticated, let ProtectedRoute handle it
  if (!user) {
    return <>{children}</>;
  }
  
  // If user's role is not in allowed roles, redirect
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
}

// Helper component for customer-only routes
export function CustomerOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRoute allowedRoles={['customer']} redirectTo="/barber-dashboard">
      {children}
    </RoleBasedRoute>
  );
}

// Helper component for barber-only routes  
export function BarberOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRoute allowedRoles={['barber']} redirectTo="/app">
      {children}
    </RoleBasedRoute>
  );
}
