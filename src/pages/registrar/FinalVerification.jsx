import { useState, useEffect } from 'react';
import {
  CheckCircle, Eye, Search, ChevronDown, ChevronUp,
  User, Hash, FileText, Calendar, Award, MessageSquare, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout   from '../../component/layout/DashboardLayout';
import Button            from '../../component/common/Button';
import Alert             from '../../component/common/Alert';
import clearanceService  from '../../services/clearanceService';
import { formatDate }    from '../../utils/formatDate';

const FinalVerification = () => {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,    setSearch]    = useState('');
  const [expanded,  setExpanded]  = useState(null);
  const [comment,   setComment]   = useState('');
  const [submitting,setSubmitting]= useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await clearanceService.getFinalQueue();
      setRequests(res.data.requests);
    } catch {
      toast.error('Failed to load verification queue.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    const name = `${r.student?.firstName ?? ''} ${r.student?.lastName ?? ''}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      r.student?.matricNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.requestId?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleExpand = (id) => {
    setExpanded(prev => prev === id ? null : id);
    setComment('');
  };

  const handleApprove = async (req) => {
    try {
      setSubmitting(req._id);
      await clearanceService.finalApprove(req._id, comment);
      toast.success(`Final clearance approved for ${req.student.firstName} ${req.student.lastName}!`);
      setExpanded(null);
      await fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed. Please try again.');
    } finally {
      setSubmitting(null);
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

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Final Verification</h1>
        <p className="page-subtitle">
          Students who have cleared all departments and are awaiting your final approval
        </p>
      </div>

      <Alert
        variant="info"
        title="Final Approval"
        message="These students have been approved by all departmental officers. Review and give final clearance to enable certificate generation."
      />

      <div style={{ marginTop: 'var(--space-5)' }}>
        <div style={{ position: 'relative', marginBottom: 'var(--space-4)', maxWidth: 480 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
          <input
            type="text"
            placeholder="Search by name, matric or request ID..."
            className="form-input has-icon-left"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.length === 0 ? (
            <div className="card">
              <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                No requests awaiting final approval
              </div>
            </div>
          ) : filtered.map(req => {
            const isExpanded   = expanded === req._id;
            const isSubmitting = submitting === req._id;

            return (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', flexWrap: 'wrap' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)',
                  }}>
                    {req.student?.firstName?.[0]}{req.student?.lastName?.[0]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)', color: 'var(--color-gray-900)' }}>
                        {req.student?.firstName} {req.student?.lastName}
                      </p>
                      <span className="badge badge-warning">Awaiting Final Approval</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginTop: 2 }}>
                      {req.student?.matricNumber} &nbsp;·&nbsp; {req.programme} &nbsp;·&nbsp; Submitted {formatDate(req.submittedAt)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
                    <Button variant="success" size="sm" loading={isSubmitting} onClick={() => handleApprove(req)}>
                      <CheckCircle size={14} /> Approve
                    </Button>
                    <button onClick={() => toggleExpand(req._id)} className="btn btn-secondary btn-sm">
                      <Eye size={14} /> {isExpanded ? 'Hide' : 'Details'}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--color-gray-100)', padding: 'var(--space-5)' }}>
                    <div className="content-grid content-grid-3" style={{ gap: 'var(--space-6)' }}>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-3)' }}>
                          Student Details
                        </p>
                        {[
                          { icon: <User size={13} />,     label: 'Full Name', value: `${req.student?.firstName} ${req.student?.lastName}` },
                          { icon: <Hash size={13} />,     label: 'Matric No.', value: req.student?.matricNumber },
                          { icon: <FileText size={13} />, label: 'Programme',  value: req.programme },
                          { icon: <Calendar size={13} />, label: 'Session',    value: req.sessionCompleted },
                          { icon: <Calendar size={13} />, label: 'Submitted',  value: formatDate(req.submittedAt) },
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-100)', fontSize: 'var(--text-sm)' }}>
                            <span style={{ color: 'var(--color-gray-400)' }}>{row.icon}</span>
                            <span style={{ color: 'var(--color-gray-500)', minWidth: 90 }}>{row.label}</span>
                            <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-3)' }}>
                          Department Approvals ({req.departments?.length}/{req.departments?.length})
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                          {req.departments?.map((dept, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                              padding: 'var(--space-2) var(--space-3)',
                              background: 'var(--color-success-light)',
                              borderRadius: 'var(--radius)',
                              border: '1px solid #bbf7d0',
                            }}>
                              <CheckCircle size={14} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-success-dark)' }}>
                                  {dept.departmentName}
                                </p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                                  {dept.officer ? `${dept.officer.firstName} ${dept.officer.lastName}` : ''} &nbsp;·&nbsp; {dept.reviewedAt ? formatDate(dept.reviewedAt) : ''}
                                </p>
                                {dept.comment && (
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontStyle: 'italic', marginTop: 2 }}>
                                    {dept.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          <div className="form-group">
                            <label className="form-label">
                              <MessageSquare size={13} style={{ display: 'inline', marginRight: 6 }} />
                              Registrar Comment (Optional)
                            </label>
                            <textarea
                              className="form-textarea"
                              rows={2}
                              placeholder="Add a final note if needed..."
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => setExpanded(null)}>Cancel</Button>
                            <Button variant="success" loading={isSubmitting} onClick={() => handleApprove(req)}>
                              <Award size={16} /> Grant Final Clearance
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinalVerification;