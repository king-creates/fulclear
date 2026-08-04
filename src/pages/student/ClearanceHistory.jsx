import DashboardLayout  from '../../component/layout/DashboardLayout';
import { formatDate }   from '../../utils/formatDate';

const mockHistory = [
  { id: 'CLR-2025-0042', session: '2024/2025', submitted: '2025-06-01', status: 'in_progress', departments: 10, cleared: 6  },
  { id: 'CLR-2024-0018', session: '2023/2024', submitted: '2024-05-15', status: 'completed',   departments: 10, cleared: 10 },
  { id: 'CLR-2023-0007', session: '2022/2023', submitted: '2023-06-10', status: 'completed',   departments: 10, cleared: 10 },
];

const statusStyle = {
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed:   { label: 'Completed',   variant: 'success' },
  rejected:    { label: 'Rejected',    variant: 'danger'  },
};

const ClearanceHistory = () => (
  <DashboardLayout>
    <div className="page-header">
      <h1 className="page-title">Clearance History</h1>
      <p className="page-subtitle">All your past and current clearance requests</p>
    </div>

    <div className="card">
      <div className="card-header">
        <h2 className="card-title">All Requests</h2>
        <span className="badge badge-gray">{mockHistory.length} total</span>
      </div>
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
            {mockHistory.map((row) => {
              const pct = Math.round((row.cleared / row.departments) * 100);
              const s   = statusStyle[row.status];
              return (
                <tr key={row.id}>
                  <td style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-primary-700)', fontFamily: 'monospace' }}>{row.id}</td>
                  <td>{row.session}</td>
                  <td>{formatDate(row.submitted)}</td>
                  <td style={{ minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary-700)', borderRadius: 'var(--radius-full)' }} />
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', whiteSpace: 'nowrap' }}>{row.cleared}/{row.departments}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${s.variant}`}>{s.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default ClearanceHistory;