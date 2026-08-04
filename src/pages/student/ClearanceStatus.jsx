import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import { Loader2, FilePlus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout   from '../../component/layout/DashboardLayout';
import StatusTimeline    from '../../component/shared/StatusTimeline';
import Button            from '../../component/common/Button';
import clearanceService  from '../../services/clearanceService';
import { formatDate }    from '../../utils/formatDate';
import { ROUTES }        from '../../constants/routes';

const ClearanceStatus = () => {
  const [clearance,   setClearance]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [resubmitting, setResubmitting] = useState(null);

  useEffect(() => {
    fetchClearance();
  }, []);

  const fetchClearance = async () => {
    try {
      setLoading(true);
      const res = await clearanceService.getMy();
      setClearance(res.data.clearance);
    } catch {
      // empty state handles this
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (stepId) => {
    try {
      setResubmitting(stepId);
      await clearanceService.resubmitStep(clearance._id, stepId);
      toast.success('Resubmitted! The department will review it again.');
      await fetchClearance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resubmit. Try again.');
    } finally {
      setResubmitting(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
          <Loader2 size={28} className="animate-spin" color="var(--color-primary-700)" />
        </div>
      </DashboardLayout>
    );
  }

  if (!clearance) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">Clearance Status</h1>
          <p className="page-subtitle">Track your clearance progress across all departments</p>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <FilePlus size={40} color="var(--color-gray-300)" style={{ margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
              No active clearance request
            </h3>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
              You haven't submitted a clearance request yet.
            </p>
            <Link to={ROUTES.STUDENT_SUBMIT}>
              <Button variant="primary">
                <FilePlus size={16} /> Submit Clearance Request
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const rejectedSteps = clearance.departments.filter(d => d.status === 'rejected');

  const steps = clearance.departments.map(d => ({
    department: d.departmentName,
    officer:    d.officer ? `${d.officer.firstName} ${d.officer.lastName}` : '',
    status:     d.status === 'approved' ? 'approved' : d.status === 'rejected' ? 'rejected' : d.status === 'in_review' ? 'active' : 'pending',
    comment:    d.comment,
    date:       d.reviewedAt ? formatDate(d.reviewedAt) : '',
  }));

  const approved = clearance.departments.filter(d => d.status === 'approved').length;
  const total    = clearance.departments.length;
  const pct      = total > 0 ? Math.round((approved / total) * 100) : 0;

  const statusBadge = {
    submitted:   { label: 'Submitted',   variant: 'info'    },
    in_progress: { label: 'In Progress', variant: 'warning' },
    completed:   { label: 'Completed',   variant: 'success' },
    rejected:    { label: 'Action Needed', variant: 'danger' },
  };
  const badge = statusBadge[clearance.status] || statusBadge.submitted;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Clearance Status</h1>
        <p className="page-subtitle">Track your clearance progress across all departments</p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
              {[
                { label: 'Request ID',      value: clearance.requestId },
                { label: 'Submitted',       value: formatDate(clearance.submittedAt) },
                { label: 'Programme',       value: clearance.programme },
                { label: 'Graduation Year', value: clearance.graduationYear },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{f.label}</p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>{f.value}</p>
                </div>
              ))}
            </div>
            <span className={`badge badge-${badge.variant}`} style={{ fontSize: 'var(--text-sm)', padding: '6px 14px' }}>
              {rejectedSteps.length > 0 ? 'Action Needed' : badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Rejected steps needing action */}
      {rejectedSteps.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', border: '1.5px solid var(--color-danger)' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ color: 'var(--color-danger)' }}>Action Needed</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {rejectedSteps.map(step => (
              <div key={step._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 'var(--space-3)',
                background: 'var(--color-danger-light)', borderRadius: 'var(--radius)', padding: 'var(--space-4)',
              }}>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-danger-dark)' }}>
                    {step.departmentName}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-700)', marginTop: 4 }}>
                    Reason: {step.comment}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  loading={resubmitting === step._id}
                  onClick={() => handleResubmit(step._id)}
                >
                  <RefreshCw size={14} /> Resubmit for Review
                </Button>
              </div>
            ))}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
              If your rejection was due to a document issue, upload a corrected file on the{' '}
              <Link to={ROUTES.STUDENT_DOCUMENTS} style={{ color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)' }}>
                Documents page
              </Link>{' '}
              before resubmitting.
            </p>
          </div>
        </div>
      )}

      <div className="content-grid content-grid-3">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Department Clearances</h2>
              <p className="card-subtitle">{approved} of {total} departments cleared</p>
            </div>
          </div>
          <div className="card-body">
            <StatusTimeline steps={steps} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Progress Summary</h2>
            </div>
            <div className="card-body">
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-gray-100)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="var(--color-primary-700)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <p style={{ marginTop: '-70px', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary-700)', fontFamily: 'var(--font-heading)' }}>{pct}%</p>
                <p style={{ marginTop: '42px', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>Complete</p>
              </div>

              {[
                { label: 'Approved',  count: clearance.departments.filter(d => d.status === 'approved').length,  color: 'var(--color-success)' },
                { label: 'In Review', count: clearance.departments.filter(d => d.status === 'in_review').length, color: 'var(--color-primary-700)' },
                { label: 'Rejected',  count: clearance.departments.filter(d => d.status === 'rejected').length,  color: 'var(--color-danger)' },
                { label: 'Pending',   count: clearance.departments.filter(d => d.status === 'pending').length,   color: 'var(--color-gray-300)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-800)' }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClearanceStatus;