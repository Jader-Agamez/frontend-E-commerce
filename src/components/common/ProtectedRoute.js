import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  const needsSetup = !user.twoFactorEnabled && !user.twoFactorSkipped;

  if (needsSetup && location.pathname !== '/setup-2fa') {
    return <Navigate to="/setup-2fa" replace />;
  }

  if (!needsSetup && location.pathname === '/setup-2fa') {
    return <Navigate to="/" replace />;
  }

  return children;
}
