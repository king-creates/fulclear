import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, FileText, Download, Eye, X,
  ArrowLeft, User, Calendar, Hash, MessageSquare, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button from '../../component/common/Button';
import Alert from '../../component/common/Alert';
import clearanceService from '../../services/clearanceService';
import documentService from '../../services/documentService';
import { formatDate } from '../../utils/formatDate';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

const checklist = [
  'Student identity documents verified',
  'All required documents uploaded',
  'Payment receipts are valid',
  'No outstanding obligations',
  'Documents are clear and legible',
];

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clearance, setClearance] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [decision, setDecision] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checked, setChecked] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await clearanceService.getRequestDetail(id);
      setClearance(res.data.clearance);
      setDocuments(res.data.documents);
    } catch (err) {
      toast.error('Failed to load request details.');
      navigate(ROUTES.OFFICER_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (item) =>
    setChecked(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );

  const handleDecision = async () => {
    if (!decision) return;
    if (decision === 'rejected' && !comment.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    try {
      setSubmitting(true);
      if (decision === 'approved') {
        await clearanceService.approve(id, comment);
        toast.success('Clearance approved successfully!');
      } else {
        await clearanceService.reject(id, comment);
        toast.success('Clearance rejected. Student will be notified.');
      }
      navigate(ROUTES.OFFICER_REQUESTS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await documentService.downloadDocument(doc._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to download document.');
    }
  };

  const handlePreview = async (doc) => {
    try {
      const res = await documentService.viewDocument(doc._id);
      const blob = new Blob([res.data], { type: doc.mimeType });
      const url = window.URL.createObjectURL(blob);
      setPreview({ ...doc, url });
    } catch {
      toast.error('Failed to load document preview.');
    }
  };

  const closePreview = () => {
    if (preview?.url) window.URL.revokeObjectURL(preview.url);
    setPreview(null);
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

  if (!clearance) return null;

  const myStep = clearance.departments.find(
    d => d.officer?._id === user?._id || d.department?.toString() === user?.department
  );
  const currentStepStatus = myStep?.status || 'pending';
  const alreadyDecided = currentStepStatus === 'approved' || currentStepStatus === 'rejected';

  return (
    <DashboardLayout>

      {/* Document preview modal */}
      {preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h3 className="modal-title">{preview.originalName}</h3>
              <button className="modal-close" onClick={closePreview}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ padding: 0, background: 'var(--color-gray-100)', maxHeight: '75vh', overflow: 'auto' }}>
              {preview.mimeType?.includes('pdf') ? (
                <iframe
                  src={preview.url}
                  title={preview.originalName}
                  style={{ width: '100%', height: '70vh', border: 'none' }}
                />
              ) : preview.mimeType?.includes('image') ? (
                <img
                  src={preview.url}
                  alt={preview.originalName}
                  style={{ width: '100%', display: 'block' }}
                />
              ) : (
                <p style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                  Preview not available for this file type.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={closePreview}>Close</Button>
              <Button variant="primary" onClick={() => handleDownload(preview)}>
                <Download size={16} /> Download
              </Button>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => navigate(ROUTES.OFFICER_REQUESTS)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}
        >
          <ArrowLeft size={16} /> Back to requests
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="page-title">Review Request</h1>
            <p className="page-subtitle">
              Request ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-primary-700)' }}>{clearance.requestId}</span>
            </p>
          </div>
          <span className={`badge badge-${currentStepStatus === 'approved' ? 'success' : currentStepStatus === 'rejected' ? 'danger' : 'warning'}`} style={{ fontSize: 'var(--text-sm)', padding: '6px 14px', alignSelf: 'flex-start' }}>
            {currentStepStatus === 'approved' ? 'Approved' : currentStepStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
          </span>
        </div>
      </div>

      <div className="content-grid content-grid-3">

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Student Information</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--color-primary-700)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xl)',
                }}>
                  {clearance.student?.firstName?.[0]}{clearance.student?.lastName?.[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)', color: 'var(--color-gray-900)' }}>
                    {clearance.student?.firstName} {clearance.student?.lastName}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    {clearance.student?.email}
                  </p>
                </div>
              </div>

              {[
                { icon: <Hash size={14} />, label: 'Matric Number', value: clearance.student?.matricNumber },
                { icon: <User size={14} />, label: 'Department', value: clearance.student?.department },
                { icon: <FileText size={14} />, label: 'Programme', value: clearance.programme },
                { icon: <Calendar size={14} />, label: 'Session', value: clearance.sessionCompleted },
                { icon: <Calendar size={14} />, label: 'Submitted', value: formatDate(clearance.submittedAt) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <span style={{ color: 'var(--color-gray-400)' }}>{row.icon}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', minWidth: 110 }}>{row.label}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{row.value}</span>
                </div>
              ))}

              {clearance.remarks && (
                <div style={{ marginTop: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius)', padding: 'var(--space-3)', borderLeft: '3px solid var(--color-primary-400)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginBottom: 4, fontWeight: 'var(--font-semibold)' }}>STUDENT REMARKS</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-700)', fontStyle: 'italic', lineHeight: 1.6 }}>"{clearance.remarks}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Submitted Documents</h2>
              <span className="badge badge-gray">{documents.length} files</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {documents.length === 0 && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)', textAlign: 'center', padding: 'var(--space-6)' }}>
                  No documents uploaded yet.
                </p>
              )}
              {documents.map(doc => (
                <div key={doc._id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-gray-50)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: doc.mimeType?.includes('pdf') ? 'var(--color-danger-light)' : 'var(--color-info-light)',
                    color: doc.mimeType?.includes('pdf') ? 'var(--color-danger)' : 'var(--color-info)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{doc.originalName}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{(doc.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" title="Preview" onClick={() => handlePreview(doc)}>
                    <Eye size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {alreadyDecided ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                {currentStepStatus === 'approved' ? (
                  <CheckCircle size={40} color="var(--color-success)" style={{ margin: '0 auto var(--space-4)' }} />
                ) : (
                  <XCircle size={40} color="var(--color-danger)" style={{ margin: '0 auto var(--space-4)' }} />
                )}
                <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>
                  You have already {currentStepStatus === 'approved' ? 'approved' : 'rejected'} this request.
                </p>
                {myStep?.comment && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginTop: 'var(--space-3)', fontStyle: 'italic' }}>
                    "{myStep.comment}"
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Your Decision</h2>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  {[
                    { value: 'approved', label: 'Approve', icon: <CheckCircle size={28} />, color: 'var(--color-success)', bg: 'var(--color-success-light)', textColor: 'var(--color-success-dark)' },
                    { value: 'rejected', label: 'Reject', icon: <XCircle size={28} />, color: 'var(--color-danger)', bg: 'var(--color-danger-light)', textColor: 'var(--color-danger-dark)' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDecision(opt.value)}
                      style={{
                        padding: 'var(--space-4)',
                        border: `2px solid ${decision === opt.value ? opt.color : 'var(--color-gray-200)'}`,
                        borderRadius: 'var(--radius)',
                        background: decision === opt.value ? opt.bg : 'var(--color-white)',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <span style={{ color: decision === opt.value ? opt.color : 'var(--color-gray-300)' }}>{opt.icon}</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: decision === opt.value ? opt.textColor : 'var(--color-gray-500)' }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MessageSquare size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Comment / Remark
                    {decision === 'rejected' && <span className="required"> *</span>}
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder={decision === 'rejected' ? 'Required: Explain the reason for rejection...' : 'Optional: Add a note for the student...'}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>

                {decision === 'rejected' && (
                  <Alert variant="warning" message="The student will be notified of this rejection and must address the issue before resubmitting." />
                )}

                <Button
                  variant={decision === 'approved' ? 'success' : decision === 'rejected' ? 'danger' : 'primary'}
                  block
                  disabled={!decision}
                  loading={submitting}
                  onClick={handleDecision}
                >
                  {decision === 'approved' && <><CheckCircle size={16} /> Confirm Approval</>}
                  {decision === 'rejected' && <><XCircle size={16} /> Confirm Rejection</>}
                  {!decision && 'Select a Decision Above'}
                </Button>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Review Checklist</h2>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>{checked.length}/{checklist.length}</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {checklist.map((item, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-gray-700)' }}>
                  <input
                    type="checkbox"
                    checked={checked.includes(item)}
                    onChange={() => toggleCheck(item)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-primary-700)', flexShrink: 0 }}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestDetail;