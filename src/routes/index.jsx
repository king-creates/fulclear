import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector }             from 'react-redux';

import ProtectedRoute from './ProtectedRoute';
import { ROLES }      from '../constants/roles';
import { ROUTES }     from '../constants/routes';

// Auth
import Login           from '../pages/auth/Login';
import Register        from '../pages/auth/Register';
import VerifyEmail     from '../pages/auth/VerifyEmail';
import ForgotPassword  from '../pages/auth/ForgotPassword';

// Student
import StudentDashboard    from '../pages/student/StudentDashboard';
import SubmitClearance     from '../pages/student/SubmitClearance';
import ClearanceStatus     from '../pages/student/ClearanceStatus';
import UploadDocuments     from '../pages/student/UploadDocument';
import ClearanceHistory    from '../pages/student/ClearanceHistory';
import Certificate         from '../pages/student/Certificate';
import StudentNotifications from '../pages/student/Notifications';

// Officer
import OfficerDashboard    from '../pages/officer/OfficerDashboard';
import ReviewRequests      from '../pages/officer/ReviewRequests';
import RequestDetail       from '../pages/officer/RequestDetails';
import OfficerNotifications from '../pages/officer/OfficerNotification';

// Registrar
import RegistrarDashboard  from '../pages/registrar/RegistrarDashboard';
import FinalVerification   from '../pages/registrar/FinalVerification';
import IssueCertificate    from '../pages/registrar/IssueCertificate';
import RegistrarReports    from '../pages/registrar/Reports';

// Admin
import AdminDashboard      from '../pages/admin/AdminDashboard';
import ManageUsers         from '../pages/admin/ManageUsers';
import ManageDepartments   from '../pages/admin/ManageDepartments';
import AssignOfficers      from '../pages/admin/AssignOfficers';
import AuditLogs           from '../pages/admin/AuditLogs';
import SystemConfig        from '../pages/admin/SystemConfig';
import AdminReports        from '../pages/admin/Reports';

// Other
import Landing  from '../pages/Landing';
import NotFound from '../pages/NotFound';

/* Redirects logged-in users away from login/register */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);

  if (!isAuthenticated) return children;

  switch (user?.role) {
    case ROLES.STUDENT:   return <Navigate to={ROUTES.STUDENT_DASHBOARD}   replace />;
    case ROLES.OFFICER:   return <Navigate to={ROUTES.OFFICER_DASHBOARD}   replace />;
    case ROLES.REGISTRAR: return <Navigate to={ROUTES.REGISTRAR_DASHBOARD} replace />;
    case ROLES.ADMIN:     return <Navigate to={ROUTES.ADMIN_DASHBOARD}     replace />;
    default:              return <Navigate to={ROUTES.LOGIN}               replace />;
  }
};

const AppRoutes = () => (
  <Routes>

    {/* Public */}
    <Route path={ROUTES.HOME} element={<Landing />} />

    <Route path={ROUTES.LOGIN} element={
      <PublicRoute><Login /></PublicRoute>
    } />
    <Route path={ROUTES.REGISTER} element={
      <PublicRoute><Register /></PublicRoute>
    } />
    <Route path={ROUTES.VERIFY_EMAIL}    element={<VerifyEmail />} />
    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

    {/* Student */}
    <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
      <Route path={ROUTES.STUDENT_DASHBOARD}    element={<StudentDashboard />} />
      <Route path={ROUTES.STUDENT_SUBMIT}       element={<SubmitClearance />} />
      <Route path={ROUTES.STUDENT_STATUS}       element={<ClearanceStatus />} />
      <Route path={ROUTES.STUDENT_DOCUMENTS}    element={<UploadDocuments />} />
      <Route path={ROUTES.STUDENT_HISTORY}      element={<ClearanceHistory />} />
      <Route path={ROUTES.STUDENT_CERTIFICATE}  element={<Certificate />} />
      <Route path={ROUTES.STUDENT_NOTIFICATIONS}element={<StudentNotifications />} />
    </Route>

    {/* Officer */}
    <Route element={<ProtectedRoute allowedRoles={[ROLES.OFFICER]} />}>
      <Route path={ROUTES.OFFICER_DASHBOARD}      element={<OfficerDashboard />} />
      <Route path={ROUTES.OFFICER_REQUESTS}       element={<ReviewRequests />} />
      <Route path={ROUTES.OFFICER_REQUEST_DETAIL} element={<RequestDetail />} />
      <Route path={ROUTES.OFFICER_NOTIFICATIONS}  element={<OfficerNotifications />} />
    </Route>

    {/* Registrar */}
    <Route element={<ProtectedRoute allowedRoles={[ROLES.REGISTRAR]} />}>
      <Route path={ROUTES.REGISTRAR_DASHBOARD}    element={<RegistrarDashboard />} />
      <Route path={ROUTES.REGISTRAR_VERIFICATION} element={<FinalVerification />} />
      <Route path={ROUTES.REGISTRAR_CERTIFICATES} element={<IssueCertificate />} />
      <Route path={ROUTES.REGISTRAR_REPORTS}      element={<RegistrarReports />} />
    </Route>

    {/* Admin */}
    <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
      <Route path={ROUTES.ADMIN_DASHBOARD}   element={<AdminDashboard />} />
      <Route path={ROUTES.ADMIN_USERS}       element={<ManageUsers />} />
      <Route path={ROUTES.ADMIN_DEPARTMENTS} element={<ManageDepartments />} />
      <Route path={ROUTES.ADMIN_OFFICERS}    element={<AssignOfficers />} />
      <Route path={ROUTES.ADMIN_LOGS}        element={<AuditLogs />} />
      <Route path={ROUTES.ADMIN_CONFIG}      element={<SystemConfig />} />
      <Route path={ROUTES.ADMIN_REPORTS}     element={<AdminReports />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;