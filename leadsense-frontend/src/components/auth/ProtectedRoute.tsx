import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  /** Optional: redirect if user lacks all of these roles */
  roles?: string[];
  /** Optional: render children instead of Outlet (for wrapping layout routes) */
  children?: React.ReactNode;
}

export function ProtectedRoute({ roles, children }: Props) {
  const { isAuth, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.some(r => hasRole(r))) {
    return <Navigate to="/" replace />;
  }

  // When used as a layout wrapper (with children) render children,
  // otherwise render nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
}
