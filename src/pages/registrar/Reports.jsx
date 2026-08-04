import { useState }    from 'react';
import {
  BarChart2, Download, Calendar,
  Users, Award, CheckCircle, Clock,
} from 'lucide-react';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';
import { formatDate }  from '../../utils/formatDate';

const mockSummary = [
  { label: 'Total Applications',   value: '94',  icon: <Users size={22} />,       variant: 'primary' },
  { label: 'Fully Cleared',        value: '61',  icon: <CheckCircle size={22} />, variant: 'success' },
  { label: 'In Progress',          value: '27',  icon: <Clock size={22} />,       variant: 'warning' },
  { label: 'Certificates Issued',  value: '54',  icon: <Award size={22} />,       variant: 'info'    },
];

const mockByDepartment = [
  { department: 'Library',          total: 94, approved: 88, rejected: 3, pending: 3  },
  { department: 'Bursary',          total: 94, approved: 85, rejected: 5, pending: 4  },
  { department: 'Hostel Affairs',   total: 94, approved: 80, rejected: 4, pending: 10 },
  { department: 'Alumni Relations', total: 94, approved: 90, rejected: 1, pending: 3  },
  { department: 'Student Affairs',  total: 94, approved: 82, rejected: 6, pending: 6  },
  { department: 'Medical Centre',   total: 94, approved: 78, rejected: 8, pending: 8  },
  { department: 'Academic Affairs', total: 94, approved: 86, rejected: 3, pending: 5  },
  { department: 'Sports & Rec.',    total: 94, approved: 91, rejected: 2, pending: 1  },
  { department: 'ICT Unit',         total: 94, approved: 89, rejected: 1, pending: 4  },
  { department: 'Departmental',     total: 94, approved: 83, rejected: 4, pending: 7  },
];

const mockRecent = [
  { id: 'CLR-2025-0041', student: 'Tunde Fashola',  matric: 'FUL/BS/2020/017', status: 'completed', date: '2025-06-12' },
  { id: 'CLR-2025-0040', student: 'Kemi Adesanya',  matric: 'FUL/PH/2020/009', status: 'completed', date: '2025-06-12' },
  { id: 'CLR-2025-0039', student: 'Emeka Nwachukwu',matric: 'FUL/EE/2020/014', status: 'in_progress',date: '2025-06-11'},
  { id: 'CLR-2025-0038', student: 'Fatima Bello',   matric: 'FUL/AC/2020/022', status: 'in_progress',date: '2025-06-11'},
  { id: 'CLR-2025-0037', student: 'Chidi Okafor',   matric: 'FUL/ME/2020/008', status: 'completed', date: '2025-06-10' },
];

const statusBadge = {
  completed:   'badge-success',
  in_progress: 'badge-warning',
  rejected:    'badge-danger',
};

const statusLabel = {
  completed:   'Completed',
  in_progress: 'In Progress',
  rejected:    'Rejected',
};

const Reports = () => {
  const [session, setSession] = useState('2024/2025');

  return (
    <DashboardLayout>
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}
      >
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Clearance statistics and summaries for the registrar</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={session}
            onChange={e => setSession(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
            <option value="2022/2023">2022/2023</option>
          </select>
          <Button variant="secondary" onClick={() => alert('Export coming in Phase 16')}>
            <Download size={16} /> Export Report
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid">
        {mockSummary.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.variant}`}>{s.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid content-grid-3" style={{ marginTop: 'var(--space-6)' }}>

        {/* Department breakdown */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Clearance by Department</h2>
              <p className="card-subtitle">Session: {session}</p>
            </div>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total</th>
                  <th>Approved</th>
                  <th>Rejected</th>
                  <th>Pending</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {mockByDepartment.map((row, i) => {
                  const rate = Math.round((row.approved / row.total) * 100);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)', fontSize: 'var(--text-sm)' }}>
                        {row.department}
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{row.total}</td>
                      <td>
                        <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                          {row.approved}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                          {row.rejected}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-warning)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                          {row.pending}
                        </span>
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${rate}%`, height: '100%',
                              background: rate >= 90 ? 'var(--color-success)' : rate >= 70 ? 'var(--color-warning)' : 'var(--color-danger)',
                              borderRadius: 'var(--radius-full)',
                            }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', whiteSpace: 'nowrap' }}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent clearances */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Clearances</h2>
          </div>
          <div style={{ padding: '0 var(--space-2)' }}>
            {mockRecent.map((r, i) => (
              <div key={r.id} style={{
                padding: 'var(--space-3) var(--space-3)',
                borderBottom: i < mockRecent.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }} className="truncate">
                      {r.student}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 2 }}>
                      {r.matric}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 2 }}>
                      {formatDate(r.date)}
                    </p>
                  </div>
                  <span className={`badge ${statusBadge[r.status]}`} style={{ flexShrink: 0 }}>
                    {statusLabel[r.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer" style={{ justifyContent: 'center' }}>
            <Button variant="ghost" size="sm">
              <BarChart2 size={14} /> Full Report
            </Button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Reports;