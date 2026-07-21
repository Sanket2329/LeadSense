import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Redirects the user to the correct home based on their role.
 * SuperAdmin  → /admin
 * Everyone else → /dashboard
 */
export function RoleHome() {
  const { hasRole } = useAuth();
  return hasRole('SuperAdmin')
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
}
