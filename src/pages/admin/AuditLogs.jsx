import { useState, useEffect } from 'react';
import { Search, Download, Activity, User, Shield, FileText, Loader2 } from 'lucide-react';

import DashboardLayout    from '../../component/layout/DashboardLayout';
import Button              from '../../component/common/Button';
import adminService        from '../../services/adminService';
import { formatDateTime }  from '../../utils/formatDate';

const actionColor = {
  CLEARANCE_SUBMITTED: 'badge-info',
  CLEARANCE_APPROVED:  'badge-success',
  CLEARANCE_REJECTED:  'badge-danger',
  CERTIFICATE_DOWNLOADED: 'badge-primary',
  FINAL_APPROVAL:      'badge-success',
  DOCUMENT_UPLOADED:   'badge-info',
  DOCUMENT_DELETED:    'badge-gray',
  USER_CREATED:        'badge-warning',
  USER_UPDATED:        'badge-warning',
  USER_DELETED:        'badge-danger',
  OFFICER_ASSIGNED:    'badge-warning',
  OFFICER_UNASSIGNED:  'badge-gray',
  DEPT_CREATED:        'badge-info',
  DEPT_UPDATED:        'badge-gray',
  DEPT_DELETED:        'badge-danger',
  LOGIN:               'badge-gray',
  LOGIN_FAILED:        'badge-danger',
  LOGOUT:              'badge-gray',
  PASSWORD_RESET:      'badge-warning',
  USER_REGISTERED:     'badge-info',
  CONFIG_UPDATED:      'badge-warning',
};

const roleIcon = {
  student:   <User size={14} />,
  officer:   <Shield size={14} />,
  registrar: <FileText size={14} />,
  admin:     <Activity size={14} />,
  system:    <Activity size={14} />,
};

const roleBadge = {
  student:   'badge-info',
  officer:   'badge-warning',
  registrar: 'badge-primary',
  admin:     'badge-danger',
  system:    'badge-gray',
};

const severityBadge = {
  high:   'badge-danger',
  medium: 'badge-warning',
  low:    'badge-gray',
};

const AuditLogs = () => {
  const [logs,     setLogs]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [roleFilter, severityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        limit: 100,
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(log =>
    log.userName?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())   ||
    log.detail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Complete system activity trail — {total} total entries</p>
        </div>
        <Button variant="secondary" onClick={() => alert('CSV export can be added on request')}>
          <Download size={16} /> Export Logs
        </Button>
      </div>

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        {['all', 'student', 'officer', 'registrar', 'admin', 'system'].map(f => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              borderColor: roleFilter === f ? 'var(--color-primary-700)' : 'var(--color-gray-200)',
              background:  roleFilter === f ? 'var(--color-primary-700)' : 'var(--color-white)',
              color:       roleFilter === f ? 'white' : 'var(--color-gray-600)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Severity filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'high', 'medium', 'low'].map(f => (
          <button
            key={f}
            onClick={() => setSeverityFilter(f)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid',
              fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              borderColor: severityFilter === f ? 'var(--color-gray-700)' : 'var(--color-gray-200)',
              background:  severityFilter === f ? 'var(--color-gray-700)' : 'var(--color-white)',
              color:       severityFilter === f ? 'white' : 'var(--color-gray-500)',
            }}
          >
            {f === 'all' ? 'All Severity' : `${f.charAt(0).toUpperCase() + f.slice(1)} Severity`}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              placeholder="Search by user, action or detail..."
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
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Severity</th>
                  <th>Detail</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>
                      No logs found
                    </td>
                  </tr>
                ) : filtered.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--color-gray-100)', color: 'var(--color-gray-500)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)',
                        }}>
                          {log.userName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>
                          {log.userName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${roleBadge[log.userRole] ?? 'badge-gray'}`}>
                        {roleIcon[log.userRole]} {log.userRole}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${actionColor[log.action] ?? 'badge-gray'}`} style={{ fontSize: 10 }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${severityBadge[log.severity] ?? 'badge-gray'}`} style={{ fontSize: 10, textTransform: 'uppercase' }}>
                        {log.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', maxWidth: 260 }} className="truncate">
                      {log.detail}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontFamily: 'monospace' }}>
                      {log.ipAddress}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--color-gray-100)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
          Showing {filtered.length} of {total} log entries
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;