import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';

import { toggleSidebar, toggleMobileSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/UseAuth';

/* Map route prefixes to page titles */
const getPageTitle = (pathname) => {
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (pathname.includes('/submit')) return 'Submit Clearance';
  if (pathname.includes('/status')) return 'Clearance Status';
  if (pathname.includes('/documents')) return 'My Documents';
  if (pathname.includes('/history')) return 'Clearance History';
  if (pathname.includes('/certificate')) return 'My Certificate';
  if (pathname.includes('/notifications')) return 'Notifications';
  if (pathname.includes('/requests')) return 'Review Requests';
  if (pathname.includes('/verification')) return 'Final Verification';
  if (pathname.includes('/certificates')) return 'Issue Certificates';
  if (pathname.includes('/reports')) return 'Reports';
  if (pathname.includes('/users')) return 'Manage Users';
  if (pathname.includes('/departments')) return 'Departments';
  if (pathname.includes('/officers')) return 'Assign Officers';
  if (pathname.includes('/logs')) return 'Audit Logs';
  if (pathname.includes('/config')) return 'System Config';
  return 'Portal';
};

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, handleLogout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  const title = getPageTitle(location.pathname);
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'U';

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="navbar">
      {/* Left */}
      <div className="navbar-left">
        <button
          className="navbar-toggle"
          onClick={() => {
            if (window.innerWidth <= 768) {
              dispatch(toggleMobileSidebar());
            } else {
              dispatch(toggleSidebar());
            }
          }}
        >
          <Menu size={20} />
        </button>
        <div className="navbar-breadcrumb">
          <span>Portal</span>
          <span>/</span>
          <span className="navbar-breadcrumb-current">{title}</span>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right" ref={dropRef} style={{ position: 'relative' }}>

        {/* User dropdown trigger */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px var(--space-2)', borderRadius: 'var(--radius)',
            transition: 'background var(--transition-fast)',
          }}
        >
          <div className="navbar-avatar">{initials}</div>
          <div style={{ textAlign: 'left', display: 'none' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>
              {user?.firstName}
            </p>
          </div>
          <ChevronDown size={14} color="var(--color-gray-400)" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="user-dropdown">
            <div className="user-dropdown-header">
              <p className="user-dropdown-name">{user?.firstName} {user?.lastName}</p>
              <p className="user-dropdown-email">{user?.email}</p>
            </div>
            <div style={{ padding: 'var(--space-1) 0' }}>
              <button className="user-dropdown-item" onClick={() => setOpen(false)}>
                <User size={16} /> My Profile
              </button>
              <div className="user-dropdown-divider" />
              <button className="user-dropdown-item danger" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;