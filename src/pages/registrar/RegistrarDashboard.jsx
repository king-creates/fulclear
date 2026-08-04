import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import {
  ClipboardCheck, CheckCircle,
  Award, BarChart2, ArrowRight,
} from 'lucide-react';

import DashboardLayout         from '../../component/layout/DashboardLayout';
import { PageLoader }          from '../../component/common/Spinner';
import { formatDate, timeAgo } from '../../utils/formatDate';
import { ROUTES }              from '../../constants/routes';
import { useAuth }             from '../../hooks/useAuth';

const mockStats = [
  { label: 'Awaiting Final Approval', value: '12', icon: <ClipboardCheck size={22} />, variant: 'warning' },
  { label: 'Fully Approved Today',    value: '7',  icon: <CheckCircle size={22} />,    variant: 'success' },
  { label: 'Certificates Issued',     value: '5',  icon: <Award size={22} />,          variant: 'primary' },
  { label: 'Total This Session',      value: '94', icon: <BarChart2 size={22} />,      variant: 'info'    },
];

const mockPending = [
  { id: 'CLR-2025-0041', student: 'Tunde Fashola',   matric: 'FUL/BS/2020/017', departments: 10, cleared: 10, submitted: new Date(Date.now() - 1*3600*1000).toISOString()  },
  { id: 'CLR-2025-0040', student: 'Kemi Adesanya',   matric: 'FUL/PH/2020/009', departments: 10, cleared: 10, submitted: new Date(Date.now() - 3*3600*1000).toISOString()  },
  { id: 'CLR-2025-0036', student: 'Amina Suleiman',  matric: 'FUL/LA/2020/031', departments: 10, cleared: 10, submitted: new Date(Date.now() - 6*3600*1000).toISOString()  },
  { id: 'CLR-2025-0034', student: 'Bola Ogundimu',   matric: 'FUL/ME/2020/005', departments: 10, cleared: 10, submitted: new Date(Date.now() - 12*3600*1000).toISOString() },
  { id: 'CLR-2025-0030', student: 'Chuka Eze',       matric: 'FUL/CS/2020/019', departments: 10, cleared: 10, submitted: new Date(Date.now() - 24*3600*1000).toISOString() },
];

const mockRecentlyIssued = [
  { id: 'CLR-2025-0029', student: 'Ngozi Peters',   matric: 'FUL/AC/2020/011', issuedAt: new Date(Date.now() - 2*3600*1000).toISOString()  },
  { id: 'CLR-2025-0028', student: 'Emeka Obi',      matric: 'FUL/EE/2020/007', issuedAt: new Date(Date.now() - 5*3600*1000).toISOString()  },
  { id: 'CLR-2025-0027', student: 'Fatima Aliyu',   matric: 'FUL/CH/2020/003', issuedAt: new Date(Date.now() - 10*3600*1000).toISOString() },
  { id: 'CLR-2025-0026', student: 'James Adeyinka', matric: 'FUL/LA/2020/022', issuedAt: new Date(Date.now() - 14*3600*1000).toISOString() },
];

const RegistrarDashboard = () => {
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
          <h1 className="page-title">Registrar Dashboard</h1>
          <p className="page-subtitle">
            {user?.firstName ?? 'Registrar'} &nbsp;·&nbsp; {formatDate(new Date())}
          </p>
        </div>
        <Link to={ROUTES.REGISTRAR_VERIFICATION}>
          <button className="btn btn-primary">
            <ClipboardCheck size={16} /> Final Verification
          </button>
        </Link>
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

      {/* Content grid */}
      <div className="content-grid content-grid-3">

        {/* Pending final approval */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Awaiting Final Approval</h2>
              <p className="card-subtitle">All departments cleared — ready for your sign-off</p>
            </div>
            <Link
              to={ROUTES.REGISTRAR_VERIFICATION}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div>
            {mockPending.map((req, i) => (
              <Link
                key={req.id}
                to={ROUTES.REGISTRAR_VERIFICATION}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: i < mockPending.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-success-light)', color: 'var(--color-success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)',
                  }}>
                    {req.student.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }} className="truncate">
                      {req.student}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      {req.matric} &nbsp;·&nbsp;
                      <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-medium)' }}>
                        All {req.cleared} departments cleared
                      </span>
                    </p>
                  </div>

                  {/* Time */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                      {timeAgo(req.submitted)}
                    </p>
                    <ArrowRight size={14} color="var(--color-gray-300)" style={{ marginTop: 4 }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* Recently Issued */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recently Issued</h2>
              <Link
                to={ROUTES.REGISTRAR_CERTIFICATES}
                style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)' }}
              >
                View all
              </Link>
            </div>
            <div style={{ padding: '0 var(--space-2)' }}>
              {mockRecentlyIssued.map((r, i) => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderBottom: i < mockRecentlyIssued.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Award size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }} className="truncate">
                      {r.student}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                      {r.matric} &nbsp;·&nbsp; {timeAgo(r.issuedAt)}
                    </p>
                  </div>
                  <span className="badge badge-success">Issued</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Final Verification Queue', to: ROUTES.REGISTRAR_VERIFICATION, icon: <ClipboardCheck size={16} />, variant: 'primary'   },
                { label: 'Issue Certificates',       to: ROUTES.REGISTRAR_CERTIFICATES, icon: <Award size={16} />,          variant: 'secondary' },
                { label: 'View Reports',             to: ROUTES.REGISTRAR_REPORTS,      icon: <BarChart2 size={16} />,      variant: 'secondary' },
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

export default RegistrarDashboard;