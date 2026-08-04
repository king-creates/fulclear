import { useState, useEffect } from 'react';
import { Link }        from 'react-router-dom';
import { Search, Eye, Loader2 } from 'lucide-react';

import DashboardLayout   from '../../component/layout/DashboardLayout';
import clearanceService  from '../../services/clearanceService';
import { formatDate }    from '../../utils/formatDate';

const statusBadge = {
  pending:   'badge-warning',
  in_review: 'badge-info',
  approved:  'badge-success',
  rejected:  'badge-danger',
};

const statusLabel = {
  pending:   'Pending',
  in_review: 'In Review',
  approved:  'Approved',
  rejected:  'Rejected',
};

const ReviewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [deptName, setDeptName] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await clearanceService.getDepartmentRequests(filter !== 'all' ? filter : undefined);
      setRequests(res.data.requests);
      setDeptName(res.data.department);
    } catch (err) {
      // handled by empty state
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

  const counts = {
    all:       requests.length,
    pending:   requests.filter(r => r.stepStatus === 'pending').length,
    approved:  requests.filter(r => r.stepStatus === 'approved').length,
    rejected:  requests.filter(r => r.stepStatus === 'rejected').length,
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Review Requests</h1>
        <p className="page-subtitle">
          {deptName ? `Clearance requests assigned to ${deptName}` : 'Clearance requests assigned to your unit'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
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
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              placeholder="Search by name, matric number or request ID..."
              className="form-input has-icon-left"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
            <Loader2 size={24} className="animate-spin" color="var(--color-primary-700)" />
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Request ID</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>
                      No requests found
                    </td>
                  </tr>
                ) : filtered.map(req => (
                  <tr key={req.clearanceId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xs)',
                        }}>
                          {req.student?.firstName?.[0]}{req.student?.lastName?.[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)', fontSize: 'var(--text-sm)' }}>
                            {req.student?.firstName} {req.student?.lastName}
                          </p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                            {req.student?.matricNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)' }}>
                      {req.requestId}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{formatDate(req.submittedAt)}</td>
                    <td>
                      <span className={`badge ${statusBadge[req.stepStatus] ?? 'badge-gray'}`}>
                        {statusLabel[req.stepStatus] ?? req.stepStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/officer/requests/${req.clearanceId}`}>
                        <button className="btn btn-secondary btn-sm">
                          <Eye size={14} /> Review
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--color-gray-100)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
          Showing {filtered.length} of {requests.length} requests
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewRequests;