import { useState }   from 'react';
import { Building2, Edit2, Trash2, Plus, Users, CheckCircle } from 'lucide-react';
import toast          from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';

const initialDepts = [
  { id: 'library',        name: 'Library',              code: 'LIB', officer: 'Mrs. Adaeze Eze',  officers: 2, active: true  },
  { id: 'bursary',        name: 'Bursary / Finance',    code: 'BUR', officer: 'Mr. James Obi',    officers: 3, active: true  },
  { id: 'hostel',         name: 'Hostel Affairs',       code: 'HOS', officer: 'Mrs. Ngozi Bello', officers: 2, active: true  },
  { id: 'alumni',         name: 'Alumni Relations',     code: 'ALU', officer: 'Mr. Seun Babs',    officers: 1, active: true  },
  { id: 'academic',       name: 'Academic Affairs',     code: 'ACA', officer: 'Prof. Bello',      officers: 4, active: true  },
  { id: 'studentaffairs', name: 'Student Affairs',      code: 'STU', officer: 'Dr. Kalu Eze',     officers: 3, active: true  },
  { id: 'medical',        name: 'Medical Centre',       code: 'MED', officer: 'Dr. Amaka Obi',    officers: 2, active: true  },
  { id: 'sports',         name: 'Sports & Recreation',  code: 'SPO', officer: 'Mr. Taiwo',        officers: 1, active: true  },
  { id: 'department',     name: 'Departmental Office',  code: 'DEP', officer: 'Prof. Adamu',      officers: 5, active: true  },
  { id: 'it',             name: 'ICT Unit',             code: 'ICT', officer: 'Mr. Chidi',        officers: 2, active: false },
];

const DeptModal = ({ dept, onClose, onSave }) => {
  const isEdit = !!dept?.id;
  const [form, setForm] = useState({
    name:    dept?.name    ?? '',
    code:    dept?.code    ?? '',
    officer: dept?.officer ?? '',
    active:  dept?.active  ?? true,
  });

  const handleSave = () => {
    if (!form.name || !form.code) {
      toast.error('Name and code are required.');
      return;
    }
    onSave({ ...dept, ...form });
    onClose();
    toast.success(isEdit ? 'Department updated.' : 'Department created.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Department' : 'Add Department'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Department Name <span className="required">*</span></label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Library" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Unit Code <span className="required">*</span></label>
              <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. LIB" maxLength={5} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.active ? 'active' : 'inactive'} onChange={e => setForm(p => ({ ...p, active: e.target.value === 'active' }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Head Officer</label>
            <input className="form-input" value={form.officer} onChange={e => setForm(p => ({ ...p, officer: e.target.value }))} placeholder="Officer name" />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Department'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ManageDepartments = () => {
  const [depts,     setDepts]     = useState(initialDepts);
  const [showModal, setShowModal] = useState(false);
  const [editDept,  setEditDept]  = useState(null);

  const handleSave = (saved) => {
    if (saved.id) {
      setDepts(prev => prev.map(d => d.id === saved.id ? { ...d, ...saved } : d));
    } else {
      setDepts(prev => [...prev, { ...saved, id: Date.now().toString(), officers: 0 }]);
    }
  };

  const handleDelete = (id) => {
    setDepts(prev => prev.filter(d => d.id !== id));
    toast.success('Department removed.');
  };

  const toggleActive = (id) => {
    setDepts(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  return (
    <DashboardLayout>

      {showModal && (
        <DeptModal
          dept={editDept}
          onClose={() => { setShowModal(false); setEditDept(null); }}
          onSave={handleSave}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Manage Departments</h1>
          <p className="page-subtitle">{depts.filter(d => d.active).length} active clearance units</p>
        </div>
        <Button variant="primary" onClick={() => { setEditDept(null); setShowModal(true); }}>
          <Plus size={16} /> Add Department
        </Button>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Units',    value: depts.length,                      variant: 'primary' },
          { label: 'Active',         value: depts.filter(d => d.active).length, variant: 'success' },
          { label: 'Inactive',       value: depts.filter(d => !d.active).length,variant: 'warning' },
          { label: 'Total Officers', value: depts.reduce((s, d) => s + d.officers, 0), variant: 'info' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.variant}`}><Building2 size={22} /></div>
            <div className="stat-content">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {depts.map(dept => (
          <div key={dept.id} className="card" style={{ opacity: dept.active ? 1 : 0.65 }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius)',
                    background: dept.active ? 'var(--color-primary-100)' : 'var(--color-gray-100)',
                    color:      dept.active ? 'var(--color-primary-700)' : 'var(--color-gray-400)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-900)' }}>
                      {dept.name}
                    </p>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{dept.code}</span>
                  </div>
                </div>
                <span className={`badge ${dept.active ? 'badge-success' : 'badge-gray'}`}>
                  {dept.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <Users size={14} color="var(--color-gray-400)" />
                  <span style={{ color: 'var(--color-gray-500)' }}>Head Officer:</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{dept.officer}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <CheckCircle size={14} color="var(--color-gray-400)" />
                  <span style={{ color: 'var(--color-gray-500)' }}>Officers assigned:</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{dept.officers}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => { setEditDept(dept); setShowModal(true); }}
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  className={`btn btn-sm ${dept.active ? 'btn-ghost' : 'btn-success'}`}
                  style={{ flex: 1 }}
                  onClick={() => toggleActive(dept.id)}
                >
                  {dept.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => handleDelete(dept.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ManageDepartments;