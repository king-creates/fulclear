import { useState, useEffect } from 'react';
import { Loader2, FileText } from 'lucide-react';
import DashboardLayout  from '../../component/layout/DashboardLayout';
import clearanceService from '../../services/clearanceService';
import { formatDate }   from '../../utils/formatDate';

const statusStyle = {
  in_progress: { label: 'In Progress', variant: 'warning' },
  submitted:   { label: 'Submitted',   variant: 'info'    },
  completed:   { label: 'Completed',   variant: 'success' },
  rejected:    { label: 'Rejected',    variant: 'danger'  },
};

const ClearanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await clearanceService.getMy();
      setHistory(res.data.history || []);
      setCurrent(res.data.clearance);
    } catch {
      // empty state handles this
    } finally {
      setLoading(false);
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

  const allRecords = [...(current ? [current] : []), ...history];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Clearance History</h1>
        <p className="page-subtitle">All your past and current clearance requests</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Requests</h2>
          <span className="badge badge-gray">{allRecords.length} total</span>
        </div>

        {allRecords.length === 0 ? (
          <div style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
            <FileText size={40} color="var(--color-gray-300)" style={{ margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-gray-500)' }}>No clearance requests yet.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Academic Session</th>
                  <th>Submitted</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((row) => {
                  const total   = row.departments?.length || 0;
                  const cleared = row.departments?.filter(d => d.status === 'approved').length || 0;
                  const pct     = total > 0 ? Math.round((cleared / total) * 100) : 0;
                  const s       = statusStyle[row.status] || statusStyle.submitted;

                  return (
                    <tr key={row._id}>
                      <td style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-primary-700)', fontFamily: 'monospace' }}>
                        {row.requestId}
                      </td>
                      <td>{row.sessionCompleted || '—'}</td>
                      <td>{formatDate(row.submittedAt)}</td>
                      <td style={{ minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary-700)', borderRadius: 'var(--radius-full)' }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', whiteSpace: 'nowrap' }}>{cleared}/{total}</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${s.variant}`}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClearanceHistory;