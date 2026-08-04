import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, FilePlus, Clock, Upload,
  History, Award, Bell, GraduationCap, ChevronLeft, ChevronRight,
  Users, ClipboardCheck, FileText, Settings, BarChart2, BookOpen,
} from 'lucide-react';

import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/UseAuth';
import { ROLES } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';

/* ── Nav definitions per role ── */
const studentNav = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: ROUTES.STUDENT_DASHBOARD },
  { label: 'Submit Clearance', icon: <FilePlus size={20} />, to: ROUTES.STUDENT_SUBMIT },
  { label: 'Clearance Status', icon: <Clock size={20} />, to: ROUTES.STUDENT_STATUS },
  { label: 'My Documents', icon: <Upload size={20} />, to: ROUTES.STUDENT_DOCUMENTS },
  { label: 'History', icon: <History size={20} />, to: ROUTES.STUDENT_HISTORY },
  { label: 'Certificate', icon: <Award size={20} />, to: ROUTES.STUDENT_CERTIFICATE },
  { label: 'Notifications', icon: <Bell size={20} />, to: ROUTES.STUDENT_NOTIFICATIONS, badge: true },
];

const officerNav = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: ROUTES.OFFICER_DASHBOARD },
  { label: 'Review Requests', icon: <ClipboardCheck size={20} />, to: ROUTES.OFFICER_REQUESTS, badge: true },
  { label: 'Notifications', icon: <Bell size={20} />, to: ROUTES.OFFICER_NOTIFICATIONS },
];

const registrarNav = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: ROUTES.REGISTRAR_DASHBOARD },
  { label: 'Verification', icon: <ClipboardCheck size={20} />, to: ROUTES.REGISTRAR_VERIFICATION },
  { label: 'Certificates', icon: <Award size={20} />, to: ROUTES.REGISTRAR_CERTIFICATES },
  { label: 'Reports', icon: <BarChart2 size={20} />, to: ROUTES.REGISTRAR_REPORTS },
];

const adminNav = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: ROUTES.ADMIN_DASHBOARD },
  { label: 'Manage Users', icon: <Users size={20} />, to: ROUTES.ADMIN_USERS },
  { label: 'Departments', icon: <BookOpen size={20} />, to: ROUTES.ADMIN_DEPARTMENTS },
  { label: 'Assign Officers', icon: <ClipboardCheck size={20} />, to: ROUTES.ADMIN_OFFICERS },
  { label: 'Audit Logs', icon: <FileText size={20} />, to: ROUTES.ADMIN_LOGS },
  { label: 'Reports', icon: <BarChart2 size={20} />, to: ROUTES.ADMIN_REPORTS },
  { label: 'System Config', icon: <Settings size={20} />, to: ROUTES.ADMIN_CONFIG },
];

const navByRole = {
  [ROLES.STUDENT]: studentNav,
  [ROLES.OFFICER]: officerNav,
  [ROLES.REGISTRAR]: registrarNav,
  [ROLES.ADMIN]: adminNav,
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { user, handleLogout } = useAuth();
  const collapsed = useSelector(s => s.ui.sidebarCollapsed);
  const mobileOpen = useSelector(s => s.ui.mobileSidebarOpen);
  const unread = useSelector(s => s.notifications.unread);

  const navItems = navByRole[user?.role] || studentNav;
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

      {/* Header */}
      <div className="sidebar-header">
        <GraduationCap size={28} color="var(--color-gold-400)" className="sidebar-logo" style={{ minWidth: 28 }} />
        <div className="sidebar-brand">
          <p className="sidebar-brand-name">FUL Clearance</p>
          <p className="sidebar-brand-sub">Student Portal</p>
        </div>
        {!collapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-title">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.label}</span>
            {item.badge && unread > 0 && (
              <span className="sidebar-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer user block */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.firstName} {user?.lastName}</p>
            <p className="sidebar-user-role">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;