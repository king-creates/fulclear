import { Navigate, Outlet } from 'react-router-dom';
import { useSelector }      from 'react-redux';
import { PageLoader }       from '../component/common/Spinner';
import { ROUTES }           from '../constants/routes';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector(s => s.auth);

  if (loading) return <PageLoader message="Checking authentication..." />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.NOT_FOUND} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;