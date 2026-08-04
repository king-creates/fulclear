import { useState, useEffect } from 'react';
import {
  Award, Download, Search,
  Eye, CheckCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout    from '../../component/layout/DashboardLayout';
import Button              from '../../component/common/Button';
import { formatDate }      from '../../utils/formatDate';
import clearanceService    from '../../services/clearanceService';
import certificateService  from '../../services/certificateService';

const IssueCertificate = () => {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [preview,  setPreview]  = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchCompleted();
  }, []);

  const fetchCompleted = async () => {
    try {
      setLoading(true);
      const res = await clearanceService.getAll({ status: 'completed' });
      setRecords(res.data.clearances);
    } catch {
      toast.error('Failed to load completed clearances.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter(r => {
    const name = `${r.student?.firstName ?? ''} ${r.student?.lastName ?? ''}`.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      r.student?.matricNumber?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'issued'  ? r.certificateIssued :
      filter === 'pending' ? !r.certificateIssued : true;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:     records.length,
    issued:  records.filter(r => r.certificateIssued).length,
    pending: records.filter(r => !r.certificateIssued).length,
  };

  const handleDownload = async (clearance) => {
    try {
      setDownloading(clearance._id);
      const res = await certificateService.download(clearance._id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${clearance.student?.matricNumber || clearance.requestId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded.');
      await fetchCompleted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download certificate.');
    } finally {
      setDownloading(null);
      setPreview(null);
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
        <h1 className="page-title">Issue Certificates</h1>
        <p className="page-subtitle">Download clearance certificates for fully approved students</p>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          { label: 'Total Completed',     value: records.length,      variant: 'primary' },
          { label: 'Certificates Issued', value: counts.issued,       variant: 'success' },
          { label: 'Not Yet Downloaded',  value: counts.pending,      variant: 'warning' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.variant}`}>
              <Award size={22} />
            </div>
            <div className="stat-content">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Certificate Preview</h3>
              <button className="modal-close" onClick={() => setPreview(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
              <div style={{
                border: '3px solid var(--color-primary-700)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-10)',
                background: 'var(--color-white)',
              }}>
                <Award size={56} color="var(--color-gold-400)" style={{ margin: '0 auto var(--space-4)' }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary-700)', marginBottom: 'var(--space-1)' }}>
                  Federal University Lokoja
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>
                  Student Clearance Certificate
                </p>
                <div style={{ width: 48, height: 3, background: 'var(--color-gold-400)', borderRadius: 'var(--radius-full)', margin: '0 auto var(--space-6)' }} />
                <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-3)' }}>This is to certify that</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
                  {preview.student?.firstName} {preview.student?.lastName}
                </h3>
                <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-1)' }}>{preview.student?.matricNumber}</p>
                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>{preview.programme}</p>
                <p style={{ color: 'var(--color-gray-600)', maxWidth: 400, margin: '0 auto var(--space-8)', lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>
                  has successfully completed all clearance requirements for the {preview.graduationYear} academic session and is hereby certified cleared by all relevant university departments.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--space-8)' }}>
                  {['Registrar', 'Date Issued'].map((sig, i) => (
                    <div key={i} style={{ textAlign: 'center', minWidth: 120 }}>
                      <div style={{ height: 32, borderBottom: '1.5px solid var(--color-gray-400)', marginBottom: 'var(--space-2)' }} />
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {sig === 'Date Issued' ? formatDate(preview.completedAt || new Date()) : sig}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>
              <Button variant="primary" loading={downloading === preview._id} onClick={() => handleDownload(preview)}>
                <Download size={16} /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'pending', 'issued'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              borderColor: filter === f ? 'var(--color-primary-700)' : 'var(--color-gray-200)',
              background:  filter === f ? 'var(--color-primary-700)' : 'var(--color-white)',
              color:       filter === f ? 'white' : 'var(--color-gray-600)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{
              marginLeft: 6,
              background: filter === f ? 'rgba(255,255,255,0.2)' : 'var(--color-gray-100)',
              color:      filter === f ? 'white' : 'var(--color-gray-500)',
              padding: '1px 7px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
            }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              placeholder="Search by name or matric number..."
              className="form-input has-icon-left"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Programme</th>
                <th>Final Approval</th>
                <th>Certificate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>
                    No completed clearances found
                  </td>
                </tr>
              ) : filtered.map(req => (
                <tr key={req._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: req.certificateIssued ? 'var(--color-success-light)' : 'var(--color-primary-100)',
                        color:      req.certificateIssued ? 'var(--color-success)'       : 'var(--color-primary-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xs)',
                      }}>
                        {req.certificateIssued
                          ? <CheckCircle size={16} />
                          : `${req.student?.firstName?.[0] ?? ''}${req.student?.lastName?.[0] ?? ''}`}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)', fontSize: 'var(--text-sm)' }}>
                          {req.student?.firstName} {req.student?.lastName}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{req.student?.matricNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>{req.programme}</td>
                  <td style={{ fontSize: 'var(--text-sm)' }}>{formatDate(req.completedAt)}</td>
                  <td>
                    {req.certificateIssued
                      ? <span className="badge badge-success"><CheckCircle size={12} /> Issued {req.certificateIssuedAt ? formatDate(req.certificateIssuedAt) : ''}</span>
                      : <span className="badge badge-warning">Not yet downloaded</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-ghost btn-sm" title="Preview" onClick={() => setPreview(req)}>
                        <Eye size={14} />
                      </button>
                      <Button
                        variant={req.certificateIssued ? 'secondary' : 'primary'}
                        size="sm"
                        loading={downloading === req._id}
                        onClick={() => handleDownload(req)}
                      >
                        <Download size={14} /> {req.certificateIssued ? 'Download Again' : 'Download'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--color-gray-100)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
          Showing {filtered.length} of {records.length} students
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IssueCertificate;