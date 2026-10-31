import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user?.role || user?.subRole || user?.normalizedRole || '').toLowerCase();

  const isRoleAllowed = () => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    return normalizedAllowed.some((r) => {
      if (r === userRole) return true;
      if (
        (r === 'organization' || r === 'ngo' || r === 'distributor') &&
        (userRole === 'organization' || userRole === 'ngo' || userRole === 'distributor')
      ) {
        return true;
      }
      return false;
    });
  };

  if (allowedRoles && !isRoleAllowed()) {
    const roleRedirects = {
      donor: '/donor/dashboard',
      restaurant: '/donor/dashboard',
      organization: '/organization/dashboard',
      distributor: '/organization/dashboard',
      ngo: '/organization/dashboard',
      volunteer: '/volunteer/dashboard',
      biofarm: '/biofarm/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleRedirects[userRole] || '/'} replace />;
  }

  return children;
}
