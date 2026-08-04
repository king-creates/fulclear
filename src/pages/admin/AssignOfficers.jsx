import { useState, useEffect } from 'react';
import { UserCheck, Search, Trash2, Building2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';
import adminService    from '../../services/adminService';

const AssignModal = ({ officer, departments, onClose, onSaved }) => {
  const [selected, setSelected] = useState(officer?.department || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) {
      toast.error('Please select a department.');
      return;
    }
    try {
      setSaving(true);
      await adminService.assignOfficer({ officerId: officer._id, departmentId: selected });
      toast.success(`${officer.firstName} ${officer.lastName} assigned successfully.`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign officer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Assign Officer to Department</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            background: 'var(--color-gray-50)', borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'var(--font-bold)',
            }}>
              {officer.firstName[0]}{officer.lastName[0]}
            </div>
            <div>
              <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>{officer.firstName} {officer.lastName}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>{officer.email}</p>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign to Department <span className="required">*</span></label>
            <select className="form-select" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Select a department...</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            <UserCheck size={16} /> Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};

const AssignOfficers = () => {
  const [officers,    setOfficers]    = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [deptFilter,  setDeptFilter]  = useState('all');
  const [showModal,   setShowModal]   = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        adminService.getUsers({ role: 'officer' }),
        adminService.getDepartments(),
      ]);
      setOfficers(usersRes.data.users);
      setDepartments(deptsRes.data.departments);
    } catch {
      toast.error('Failed to load officers and departments.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = officers.filter(o => {
    const name = `${o.firstName} ${o.lastName}`.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchDept =
      deptFilter === 'all'         ? true :
      deptFilter === 'unassigned'  ? !o.department :
      o.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleUnassign = async (officer) => {
    try {
      await adminService.unassignOfficer(officer._id);
      toast.success('Officer unassigned.');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unassign officer.');
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

      {showModal && selectedOfficer && (
        <AssignModal
          officer={selectedOfficer}
          departments={departments}
          onClose={() => { setShowModal(false); setSelectedOfficer(null); }}
          onSaved={fetchData}
        />
      )}

      <div className="page-header">
        <h1 className="page-title">Assign Officers</h1>
        <p className="page-subtitle">Manage department officer assignments</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          { label: 'Total Officers', value: officers.length,                          variant: 'primary' },
          { label: 'Assigned',       value: officers.filter(o => o.department).length, variant: 'success' },
          { label: 'Unassigned',     value: officers.filter(o => !o.department).length,variant: 'warning' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.variant}`}><UserCheck size={22} /></div>
            <div className="stat-content">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'unassigned', ...departments.map(d => d.name)].map(f => (
          <button
            key={f}
            onClick={() => setDeptFilter(f)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid',
              fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              borderColor: deptFilter === f ? 'var(--color-primary-700)' : 'var(--color-gray-200)',
              background:  deptFilter === f ? 'var(--color-primary-700)' : 'var(--color-white)',
              color:       deptFilter === f ? 'white' : 'var(--color-gray-600)',
            }}
          >
            {f === 'all' ? 'All' : f === 'unassigned' ? 'Unassigned' : f}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              placeholder="Search officers..."
              className="form-input has-icon-left"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Email</th>
                <th>Assigned Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>
                    No officers found
                  </td>
                </tr>
              ) : filtered.map(officer => (
                <tr key={officer._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xs)',
                      }}>
                        {officer.firstName[0]}{officer.lastName[0]}
                      </div>
                      <p style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-800)' }}>
                        {officer.firstName} {officer.lastName}
                      </p>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    {officer.email}
                  </td>
                  <td>
                    {officer.department ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Building2 size={14} color="var(--color-primary-700)" />
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-primary-700)' }}>
                          {officer.department}
                        </span>
                      </div>
                    ) : (
                      <span className="badge badge-warning">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => { setSelectedOfficer(officer); setShowModal(true); }}
                      >
                        <UserCheck size={14} />
                        {officer.department ? 'Reassign' : 'Assign'}
                      </button>
                      {officer.department && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleUnassign(officer)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--color-gray-100)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
          Showing {filtered.length} of {officers.length} officers
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignOfficers;