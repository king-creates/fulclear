import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import {
  ClipboardCheck, Clock, CheckCircle,
  XCircle, ArrowRight, Loader2,
} from 'lucide-react';

import DashboardLayout         from '../../component/layout/DashboardLayout';
import { PageLoader }          from '../../component/common/Spinner';
import { formatDate, timeAgo } from '../../utils/formatDate';
import { ROUTES }              from '../../constants/routes';
import { useAuth }             from '../../hooks/useAuth';
import clearanceService        from '../../services/clearanceService';

const OfficerDashboard = () => {
  const { user }              = useAuth();
  const [loading,  setLoading]  = useState(true);
  const [requests, setRequests] = useState([]);
  const [deptName, setDeptName] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await clearanceService.getDepartmentRequests();
      setRequests(res.data.requests);
      setDeptName(res.data.department);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  };

  const pending  = requests.filter(r => r.stepStatus === 'pending');
  const approved = requests.filter(r => r.stepStatus === 'approved');
  const rejected = requests.filter(r => r.stepStatus === 'rejected');

  const stats = [
    { label: 'Pending Review', value: pending.length,  icon: <Clock size={22} />,          variant: 'warning' },
    { label: 'Approved',       value: approved.length, icon: <CheckCircle size={22} />,    variant: 'success' },
    { label: 'Rejected',       value: rejected.length, icon: <XCircle size={22} />,        variant: 'danger'  },
    { label: 'Total Assigned', value: requests.length, icon: <ClipboardCheck size={22} />, variant: 'primary' },
  ];

  if (loading) return (
    <DashboardLayout>
      <PageLoader message="Loading dashboard..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Officer Dashboard</h1>
          <p className="page-subtitle">
            {deptName || user?.department || 'Your Unit'} &nbsp;·&nbsp; {formatDate(new Date())}
          </p>
        </div>
        <Link to={ROUTES.OFFICER_REQUESTS}>
          <button className="btn btn-primary">
            <ClipboardCheck size={16} /> Review Requests
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
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

        {/* Pending requests */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pending Reviews</h2>
              <p className="card-subtitle">Requests awaiting your action</p>
            </div>
            <Link
              to={ROUTES.OFFICER_REQUESTS}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div>
            {pending.length === 0 ? (
              <p style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>
                No pending requests right now.
              </p>
            ) : pending.slice(0, 5).map((req, i) => (
              <Link
                key={req.clearanceId}
                to={`/officer/requests/${req.clearanceId}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: i < pending.slice(0, 5).length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)',
                  }}>
                    {req.student?.firstName?.[0]}{req.student?.lastName?.[0]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }} className="truncate">
                      {req.student?.firstName} {req.student?.lastName}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      {req.student?.matricNumber}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                      {timeAgo(req.submittedAt)}
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

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recently Reviewed</h2>
            </div>
            <div style={{ padding: '0 var(--space-2)' }}>
              {[...approved, ...rejected]
                .sort((a, b) => new Date(b.reviewedAt || 0) - new Date(a.reviewedAt || 0))
                .slice(0, 5)
                .map((r, i, arr) => (
                <div key={r.clearanceId} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: r.stepStatus === 'approved' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                    color: r.stepStatus === 'approved' ? 'var(--color-success)' : 'var(--color-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {r.stepStatus === 'approved'
                      ? <CheckCircle size={16} />
                      : <XCircle    size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-800)', fontWeight: 'var(--font-medium)' }} className="truncate">
                      {r.student?.firstName} {r.student?.lastName}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                      {r.stepStatus === 'approved' ? 'Approved' : 'Rejected'} &nbsp;·&nbsp; {timeAgo(r.reviewedAt)}
                    </p>
                  </div>
                </div>
              ))}
              {approved.length === 0 && rejected.length === 0 && (
                <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>
                  No reviews yet.
                </p>
              )}
            </div>
          </div>

          {/* My Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Unit</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Officer Name', value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}` },
                { label: 'Unit',         value: deptName || user?.department || '—' },
                { label: 'Email',        value: user?.email ?? '' },
                { label: 'Total Requests', value: requests.length },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <span style={{ color: 'var(--color-gray-500)' }}>{row.label}</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default OfficerDashboard;