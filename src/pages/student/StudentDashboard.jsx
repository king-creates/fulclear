import { useState, useEffect } from 'react';
import { Link }                 from 'react-router-dom';
import {
  FilePlus, Clock, CheckCircle, XCircle,
  ArrowRight, Award, FileText,
} from 'lucide-react';

import DashboardLayout          from '../../component/layout/DashboardLayout';
import StatusTimeline           from '../../component/shared/StatusTimeline';
import { PageLoader }           from '../../component/common/Spinner';
import { ROUTES }               from '../../constants/routes';
import { useAuth }              from '../../hooks/useAuth';
import { formatDate }           from '../../utils/formatDate';
import clearanceService         from '../../services/clearanceService';
import documentService          from '../../services/documentService';
import notificationService      from '../../services/notificationService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading,       setLoading]       = useState(true);
  const [clearance,     setClearance]     = useState(null);
  const [docSummary,    setDocSummary]    = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [clearanceRes, docsRes, notifRes] = await Promise.all([
        clearanceService.getMy(),
        documentService.getMyDocuments(),
        notificationService.getAll(),
      ]);
      setClearance(clearanceRes.data.clearance);
      setDocSummary(docsRes.data.summary);
      setNotifications(notifRes.data.notifications?.slice(0, 4) || []);
    } catch {
      // empty states handle failure gracefully
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardLayout><PageLoader message="Loading your dashboard..." /></DashboardLayout>;

  const departments = clearance?.departments || [];
  const approvedCount = departments.filter(d => d.status === 'approved').length;
  const pendingCount  = departments.filter(d => d.status === 'pending' || d.status === 'in_review').length;
  const rejectedCount = departments.filter(d => d.status === 'rejected').length;
  const totalCount    = departments.length;
  const pct           = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  const stats = [
    { label: 'Departments Cleared', value: approvedCount, icon: <CheckCircle size={22} />, variant: 'success' },
    { label: 'Pending Approval',    value: pendingCount,  icon: <Clock size={22} />,        variant: 'warning' },
    { label: 'Rejected Steps',      value: rejectedCount, icon: <XCircle size={22} />,      variant: 'danger'  },
    { label: 'Total Departments',   value: totalCount,    icon: <FileText size={22} />,     variant: 'info'    },
  ];

  const timelineSteps = departments.map(d => ({
    department: d.departmentName,
    officer:    d.officer ? `${d.officer.firstName} ${d.officer.lastName}` : '',
    status:     d.status === 'approved' ? 'approved' : d.status === 'rejected' ? 'rejected' : d.status === 'in_review' ? 'active' : 'pending',
    comment:    d.comment,
    date:       d.reviewedAt ? formatDate(d.reviewedAt) : '',
  }));

  return (
    <DashboardLayout>

      {/* Page header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Welcome, {user?.firstName} 👋</h1>
          <p className="page-subtitle">
            {user?.matricNumber} &nbsp;·&nbsp; {formatDate(new Date())}
          </p>
        </div>
        {!clearance && (
          <Link to={ROUTES.STUDENT_SUBMIT}>
            <button className="btn btn-primary">
              <FilePlus size={16} /> New Clearance Request
            </button>
          </Link>
        )}
      </div>

      {!clearance ? (
        /* Empty state — no active clearance */
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <FilePlus size={40} color="var(--color-gray-300)" style={{ margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
              No active clearance request
            </h3>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
              Get started by submitting your clearance request.
            </p>
            <Link to={ROUTES.STUDENT_SUBMIT}>
              <button className="btn btn-primary">
                <FilePlus size={16} /> Submit Clearance Request
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div className="stat-card" key={i}>
                <div className={`stat-icon ${stat.variant}`}>{stat.icon}</div>
                <div className="stat-content">
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="content-grid content-grid-3">

            {/* Clearance Progress */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Clearance Progress</h2>
                  <p className="card-subtitle">Request ID: {clearance.requestId}</p>
                </div>
                <Link to={ROUTES.STUDENT_STATUS} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', fontWeight: 'var(--font-medium)' }}>Overall Progress</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary-700)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-700), var(--color-primary-400))', borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }} />
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 'var(--space-1)' }}>{approvedCount} of {totalCount} departments cleared</p>
                </div>

                <StatusTimeline steps={timelineSteps} />
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Quick Actions</h2>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { label: 'Upload Documents',     to: ROUTES.STUDENT_DOCUMENTS,   icon: <FilePlus size={16} />, variant: 'primary'   },
                    { label: 'Check Status',         to: ROUTES.STUDENT_STATUS,      icon: <Clock size={16} />,    variant: 'secondary' },
                    { label: 'Download Certificate', to: ROUTES.STUDENT_CERTIFICATE, icon: <Award size={16} />,    variant: 'secondary' },
                  ].map((action) => (
                    <Link key={action.to} to={action.to} style={{ textDecoration: 'none' }}>
                      <button className={`btn btn-${action.variant} btn-block`} style={{ justifyContent: 'flex-start' }}>
                        {action.icon} {action.label}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Document Status */}
              {docSummary && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Documents</h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>Required uploaded</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: docSummary.allRequiredMet ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {docSummary.requiredUploaded}/{docSummary.requiredTotal}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(docSummary.requiredUploaded / docSummary.requiredTotal) * 100}%`,
                        height: '100%',
                        background: docSummary.allRequiredMet ? 'var(--color-success)' : 'var(--color-primary-700)',
                        borderRadius: 'var(--radius-full)',
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Notifications */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Notifications</h2>
                  <Link to={ROUTES.STUDENT_NOTIFICATIONS} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)' }}>
                    View all
                  </Link>
                </div>
                <div style={{ padding: '0 var(--space-2)' }}>
                  {notifications.length === 0 ? (
                    <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>
                      No notifications yet.
                    </p>
                  ) : notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--color-gray-100)',
                        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                        background: n.read ? 'var(--color-gray-200)' : 'var(--color-primary-700)',
                      }} />
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-700)', lineHeight: 1.5 }}>{n.message}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 2 }}>{formatDate(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;