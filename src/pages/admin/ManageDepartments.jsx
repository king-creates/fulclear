import { useState, useEffect } from 'react';
import { Building2, Edit2, Trash2, Plus, Users, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';
import adminService    from '../../services/adminService';

const DeptModal = ({ dept, onClose, onSaved }) => {
  const isEdit = !!dept?._id;
  const [form, setForm] = useState({
    name:     dept?.name     ?? '',
    code:     dept?.code     ?? '',
    isActive: dept?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast.error('Name and code are required.');
      return;
    }
    try {
      setSaving(true);
      if (isEdit) {
        await adminService.updateDepartment(dept._id, form);
        toast.success('Department updated.');
      } else {
        await adminService.createDepartment(form);
        toast.success('Department created.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
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
              <select className="form-select" value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'active' }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Department'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ManageDepartments = () => {
  const [depts,     setDepts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept,  setEditDept]  = useState(null);

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDepartments();
      setDepts(res.data.departments);
    } catch {
      toast.error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteDepartment(id);
      toast.success('Department removed.');
      await fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  const toggleActive = async (dept) => {
    try {
      await adminService.updateDepartment(dept._id, { isActive: !dept.isActive });
      await fetchDepts();
    } catch {
      toast.error('Failed to update department status.');
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

      {showModal && (
        <DeptModal
          dept={editDept}
          onClose={() => { setShowModal(false); setEditDept(null); }}
          onSaved={fetchDepts}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Manage Departments</h1>
          <p className="page-subtitle">{depts.filter(d => d.isActive).length} active clearance units</p>
        </div>
        <Button variant="primary" onClick={() => { setEditDept(null); setShowModal(true); }}>
          <Plus size={16} /> Add Department
        </Button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Units',    value: depts.length,                              variant: 'primary' },
          { label: 'Active',         value: depts.filter(d => d.isActive).length,       variant: 'success' },
          { label: 'Inactive',       value: depts.filter(d => !d.isActive).length,      variant: 'warning' },
          { label: 'Total Officers', value: depts.reduce((s, d) => s + (d.officers?.length || 0), 0), variant: 'info' },
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {depts.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--color-gray-400)' }}>
              No departments found
            </div>
          </div>
        ) : depts.map(dept => (
          <div key={dept._id} className="card" style={{ opacity: dept.isActive ? 1 : 0.65 }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius)',
                    background: dept.isActive ? 'var(--color-primary-100)' : 'var(--color-gray-100)',
                    color:      dept.isActive ? 'var(--color-primary-700)' : 'var(--color-gray-400)',
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
                <span className={`badge ${dept.isActive ? 'badge-success' : 'badge-gray'}`}>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <Users size={14} color="var(--color-gray-400)" />
                  <span style={{ color: 'var(--color-gray-500)' }}>Head Officer:</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>
                    {dept.headOfficer ? `${dept.headOfficer.firstName} ${dept.headOfficer.lastName}` : 'Unassigned'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <CheckCircle size={14} color="var(--color-gray-400)" />
                  <span style={{ color: 'var(--color-gray-500)' }}>Officers assigned:</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{dept.officers?.length || 0}</span>
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
                  className={`btn btn-sm ${dept.isActive ? 'btn-ghost' : 'btn-success'}`}
                  style={{ flex: 1 }}
                  onClick={() => toggleActive(dept)}
                >
                  {dept.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => handleDelete(dept._id)}
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