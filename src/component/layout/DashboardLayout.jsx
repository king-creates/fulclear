import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { closeMobileSidebar } from '../../store/slices/uiSlice';

const DashboardLayout = ({ children }) => {
  const dispatch = useDispatch();
  const collapsed = useSelector(s => s.ui.sidebarCollapsed);
  const mobileOpen = useSelector(s => s.ui.mobileSidebarOpen);

  /* Close mobile sidebar on route change */
  useEffect(() => {
    dispatch(closeMobileSidebar());
  }, []);

  return (
    <div className="dashboard-layout">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => dispatch(closeMobileSidebar())}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 'calc(var(--z-sticky) - 1)',
          }}
        />
      )}

      <Sidebar />

      <div className={`dashboard-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;