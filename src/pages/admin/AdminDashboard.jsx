import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import {
  Users, Building2, ClipboardCheck,
  Award, Activity, AlertTriangle,
  CheckCircle, Clock, ArrowRight,
} from 'lucide-react';

import DashboardLayout         from '../../component/layout/DashboardLayout';
import { PageLoader }          from '../../component/common/Spinner';
import { formatDate, timeAgo } from '../../utils/formatDate';
import { ROUTES }              from '../../constants/routes';
import { useAuth }             from '../../hooks/UseAuth';

const mockStats = [
  { label: 'Total Students',    value: '1,240', icon: <Users size={22} />,          variant: 'primary' },
  { label: 'Active Clearances', value: '94',    icon: <ClipboardCheck size={22} />, variant: 'warning' },
  { label: 'Completed',         value: '61',    icon: <CheckCircle size={22} />,    variant: 'success' },
  { label: 'Departments',       value: '10',    icon: <Building2 size={22} />,      variant: 'info'    },
];

const mockRecentActivity = [
  { id: 1, type: 'approval',      message: 'Tunde Fashola received final clearance',         time: new Date(Date.now() - 1*3600*1000).toISOString()  },
  { id: 2, type: 'registration',  message: 'New student Ada Okonkwo registered',             time: new Date(Date.now() - 2*3600*1000).toISOString()  },
  { id: 3, type: 'rejection',     message: 'Yusuf Garba clearance rejected by Sports unit',  time: new Date(Date.now() - 4*3600*1000).toISOString()  },
  { id: 4, type: 'certificate',   message: 'Certificate issued to Ngozi Peters',             time: new Date(Date.now() - 6*3600*1000).toISOString()  },
  { id: 5, type: 'registration',  message: 'New officer Mrs. Bello assigned to Hostel unit', time: new Date(Date.now() - 8*3600*1000).toISOString()  },
  { id: 6, type: 'approval',      message: 'Kemi Adesanya received final clearance',         time: new Date(Date.now() - 10*3600*1000).toISOString() },
];

const mockDeptStats = [
  { name: 'Library',         cleared: 88, pending: 6  },
  { name: 'Bursary',         cleared: 85, pending: 9  },
  { name: 'Hostel Affairs',  cleared: 80, pending: 14 },
  { name: 'Student Affairs', cleared: 82, pending: 12 },
  { name: 'Medical Centre',  cleared: 78, pending: 16 },
];

const activityIcon = {
  approval:     <CheckCircle  size={16} color="var(--color-success)" />,
  registration: <Users        size={16} color="var(--color-info)"    />,
  rejection:    <AlertTriangle size={16} color="var(--color-danger)" />,
  certificate:  <Award        size={16} color="var(--color-primary-700)" />,
};

const activityBg = {
  approval:     'var(--color-success-light)',
  registration: 'var(--color-info-light)',
  rejection:    'var(--color-danger-light)',
  certificate:  'var(--color-primary-50)',
};

const AdminDashboard = () => {
  const { user }              = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return (
    <DashboardLayout>
      <PageLoader message="Loading dashboard..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>

      {/* Header */}
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}
      >
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            System overview &nbsp;·&nbsp; {formatDate(new Date())}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to={ROUTES.ADMIN_USERS}>
            <button className="btn btn-secondary">
              <Users size={16} /> Manage Users
            </button>
          </Link>
          <Link to={ROUTES.ADMIN_REPORTS}>
            <button className="btn btn-primary">
              <Activity size={16} /> View Reports
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {mockStats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.variant}`}>{s.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="content-grid content-grid-3">

        {/* Department performance */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Department Performance</h2>
              <p className="card-subtitle">Clearance rates this session</p>
            </div>
            <Link
              to={ROUTES.ADMIN_DEPARTMENTS}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {mockDeptStats.map((dept, i) => {
              const total = dept.cleared + dept.pending;
              const pct   = Math.round((dept.cleared / total) * 100);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-700)' }}>
                      {dept.name}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      {dept.cleared}/{total} &nbsp;({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: pct >= 90 ? 'var(--color-success)' : pct >= 75 ? 'var(--color-primary-700)' : 'var(--color-warning)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* Recent activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <Link
                to={ROUTES.ADMIN_LOGS}
                style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)' }}
              >
                Audit logs
              </Link>
            </div>
            <div style={{ padding: '0 var(--space-2)' }}>
              {mockRecentActivity.map((a, i) => (
                <div key={a.id} style={{
                  display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
                  padding: 'var(--space-3)',
                  borderBottom: i < mockRecentActivity.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: activityBg[a.type],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {activityIcon[a.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-700)', lineHeight: 1.4 }}>
                      {a.message}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 2 }}>
                      {timeAgo(a.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Manage Users',     to: ROUTES.ADMIN_USERS,       icon: <Users size={16} />,          variant: 'primary'   },
                { label: 'Departments',      to: ROUTES.ADMIN_DEPARTMENTS,  icon: <Building2 size={16} />,      variant: 'secondary' },
                { label: 'Assign Officers',  to: ROUTES.ADMIN_OFFICERS,     icon: <ClipboardCheck size={16} />, variant: 'secondary' },
                { label: 'Audit Logs',       to: ROUTES.ADMIN_LOGS,         icon: <Activity size={16} />,       variant: 'secondary' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                  <button className={`btn btn-${a.variant} btn-block`} style={{ justifyContent: 'flex-start' }}>
                    {a.icon} {a.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;