import { useSelector, useDispatch } from 'react-redux';
import { useNavigate }              from 'react-router-dom';
import { logout }                   from '../store/slices/authSlice';
import { clearClearance }           from '../store/slices/clearanceSlice';
import { clearNotifications }       from '../store/slices/notificationSlice';
import { ROLES }                    from '../constants/roles';
import { ROUTES }                   from '../constants/routes';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector(s => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearClearance());
    dispatch(clearNotifications());
    navigate(ROUTES.LOGIN);
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case ROLES.STUDENT:   return ROUTES.STUDENT_DASHBOARD;
      case ROLES.OFFICER:   return ROUTES.OFFICER_DASHBOARD;
      case ROLES.REGISTRAR: return ROUTES.REGISTRAR_DASHBOARD;
      case ROLES.ADMIN:     return ROUTES.ADMIN_DASHBOARD;
      default:              return ROUTES.LOGIN;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    isStudent:   user?.role === ROLES.STUDENT,
    isOfficer:   user?.role === ROLES.OFFICER,
    isRegistrar: user?.role === ROLES.REGISTRAR,
    isAdmin:     user?.role === ROLES.ADMIN,
    handleLogout,
    getDashboardRoute,
  };
};