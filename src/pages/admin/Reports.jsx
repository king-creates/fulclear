import { useState }   from 'react';
import {
  BarChart2, Download, Users,
  CheckCircle, Clock, Award, XCircle,
} from 'lucide-react';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';
import { formatDate }  from '../../utils/formatDate';

const mockSummary = [
  { label: 'Total Students',     value: '1,240', icon: <Users size={22} />,       variant: 'primary' },
  { label: 'Clearances Completed',value: '61',   icon: <CheckCircle size={22} />, variant: 'success' },
  { label: 'In Progress',        value: '27',    icon: <Clock size={22} />,       variant: 'warning' },
  { label: 'Rejected Steps',     value: '18',    icon: <XCircle size={22} />,     variant: 'danger'  },
  { label: 'Certificates Issued',value: '54',    icon: <Award size={22} />,       variant: 'info'    },
];

const mockDeptBreakdown = [
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

const mockTopStudents = [
  { name: 'Tunde Fashola',  matric: 'FUL/BS/2020/017', programme: 'Business Admin', completedAt: '2025-06-12' },
  { name: 'Kemi Adesanya',  matric: 'FUL/PH/2020/009', programme: 'Physics',        completedAt: '2025-06-12' },
  { name: 'Amina Suleiman', matric: 'FUL/LA/2020/031', programme: 'Law',            completedAt: '2025-06-11' },
  { name: 'Ngozi Peters',   matric: 'FUL/AC/2020/011', programme: 'Accounting',     completedAt: '2025-06-10' },
  { name: 'Emeka Obi',      matric: 'FUL/EE/2020/007', programme: 'Elec. Eng.',     completedAt: '2025-06-09' },
];

const AdminReports = () => {
  const [session, setSession] = useState('2024/2025');

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">System Reports</h1>
          <p className="page-subtitle">Full system analytics and clearance statistics</p>
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
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* Summary */}
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

      {/* Charts section — visual bar representation */}
      <div className="content-grid content-grid-3" style={{ marginTop: 'var(--space-6)' }}>

        {/* Department breakdown */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Department Breakdown</h2>
              <p className="card-subtitle">Clearance rates per unit — {session}</p>
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
                  <th>Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {mockDeptBreakdown.map((row, i) => {
                  const rate = Math.round((row.approved / row.total) * 100);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-800)' }}>
                        {row.department}
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{row.total}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                        {row.approved}
                      </td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                        {row.rejected}
                      </td>
                      <td style={{ color: 'var(--color-warning)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                        {row.pending}
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${rate}%`, height: '100%', borderRadius: 'var(--radius-full)',
                              background: rate >= 90 ? 'var(--color-success)' : rate >= 75 ? 'var(--color-primary-700)' : 'var(--color-warning)',
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

        {/* Recently completed */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recently Completed</h2>
          </div>
          <div style={{ padding: '0 var(--space-2)' }}>
            {mockTopStudents.map((s, i) => (
              <div key={i} style={{
                padding: 'var(--space-3)',
                borderBottom: i < mockTopStudents.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-success-light)', color: 'var(--color-success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }} className="truncate">
                      {s.name}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      {s.matric} &nbsp;·&nbsp; {formatDate(s.completedAt)}
                    </p>
                  </div>
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

export default AdminReports;