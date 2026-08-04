import { useState }   from 'react';
import { UserCheck, Search, Plus, Trash2, Building2 } from 'lucide-react';
import toast          from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';

const allOfficers = [
  { id: 4,  name: 'Adaeze Eze',    email: 'adaeze@ful.edu.ng', assignedTo: 'Library'        },
  { id: 5,  name: 'James Obi',     email: 'james@ful.edu.ng',  assignedTo: 'Bursary'        },
  { id: 6,  name: 'Ngozi Bello',   email: 'ngozi@ful.edu.ng',  assignedTo: 'Hostel Affairs' },
  { id: 8,  name: 'Amaka Obi',     email: 'amaka@ful.edu.ng',  assignedTo: 'Medical Centre' },
  { id: 11, name: 'Seun Babs',     email: 'seun@ful.edu.ng',   assignedTo: 'Alumni'         },
  { id: 12, name: 'Kalu Eze',      email: 'kalu@ful.edu.ng',   assignedTo: 'Student Affairs'},
  { id: 13, name: 'Taiwo Adeyemi', email: 'taiwo@ful.edu.ng',  assignedTo: null             },
  { id: 14, name: 'Chidi Nwosu',   email: 'chidi@ful.edu.ng',  assignedTo: null             },
  { id: 15, name: 'Bello Musa',    email: 'bello@ful.edu.ng',  assignedTo: null             },
];

const departments = [
  'Library', 'Bursary', 'Hostel Affairs', 'Alumni Relations',
  'Academic Affairs', 'Student Affairs', 'Medical Centre',
  'Sports & Recreation', 'ICT Unit', 'Departmental Office',
];

const AssignModal = ({ officer, onClose, onSave }) => {
  const [selected, setSelected] = useState(officer?.assignedTo ?? '');

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
              {officer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>{officer.name}</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>{officer.email}</p>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign to Department <span className="required">*</span></label>
            <select className="form-select" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Select a department...</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!selected) { toast.error('Please select a department.'); return; }
              onSave({ ...officer, assignedTo: selected });
              onClose();
              toast.success(`${officer.name} assigned to ${selected}.`);
            }}
          >
            <UserCheck size={16} /> Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};

const AssignOfficers = () => {
  const [officers,    setOfficers]    = useState(allOfficers);
  const [search,      setSearch]      = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [deptFilter,  setDeptFilter]  = useState('all');

  const uniqueDepts = ['all', ...new Set(officers.filter(o => o.assignedTo).map(o => o.assignedTo))];

  const filtered = officers.filter(o => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchDept =
      deptFilter === 'all'         ? true :
      deptFilter === 'unassigned'  ? !o.assignedTo :
      o.assignedTo === deptFilter;
    return matchSearch && matchDept;
  });

  const handleSave = (updated) => {
    setOfficers(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const handleUnassign = (id) => {
    setOfficers(prev => prev.map(o => o.id === id ? { ...o, assignedTo: null } : o));
    toast.success('Officer unassigned.');
  };

  return (
    <DashboardLayout>

      {showModal && selectedOfficer && (
        <AssignModal
          officer={selectedOfficer}
          onClose={() => { setShowModal(false); setSelectedOfficer(null); }}
          onSave={handleSave}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Assign Officers</h1>
          <p className="page-subtitle">Manage department officer assignments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          { label: 'Total Officers', value: officers.length,                          variant: 'primary' },
          { label: 'Assigned',       value: officers.filter(o => o.assignedTo).length, variant: 'success' },
          { label: 'Unassigned',     value: officers.filter(o => !o.assignedTo).length,variant: 'warning' },
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

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'unassigned', ...departments.slice(0, 4)].map(f => (
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
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
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
              placeholder="Search officers..."
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
                <tr key={officer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xs)',
                      }}>
                        {officer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-800)' }}>
                        {officer.name}
                      </p>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    {officer.email}
                  </td>
                  <td>
                    {officer.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Building2 size={14} color="var(--color-primary-700)" />
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-primary-700)' }}>
                          {officer.assignedTo}
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
                        {officer.assignedTo ? 'Reassign' : 'Assign'}
                      </button>
                      {officer.assignedTo && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleUnassign(officer.id)}
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