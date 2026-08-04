import { useState }   from 'react';
import {
  Search, UserPlus, Edit2, Trash2,
  ChevronDown, Shield, User, Mail,
} from 'lucide-react';
import toast          from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';
import { formatDate }  from '../../utils/formatDate';

const mockUsers = [
  { id: 1,  firstName: 'Ada',    lastName: 'Okonkwo',    email: 'ada@ful.edu.ng',     role: 'student',   department: 'Computer Science',   status: 'active',   createdAt: '2024-09-01', matric: 'FUL/CS/2020/001' },
  { id: 2,  firstName: 'Emeka',  lastName: 'Nwachukwu',  email: 'emeka@ful.edu.ng',   role: 'student',   department: 'Electrical Eng.',    status: 'active',   createdAt: '2024-09-01', matric: 'FUL/EE/2020/014' },
  { id: 3,  firstName: 'Fatima', lastName: 'Bello',      email: 'fatima@ful.edu.ng',  role: 'student',   department: 'Accounting',         status: 'active',   createdAt: '2024-09-02', matric: 'FUL/AC/2020/022' },
  { id: 4,  firstName: 'Adaeze', lastName: 'Eze',        email: 'adaeze@ful.edu.ng',  role: 'officer',   department: 'Library',            status: 'active',   createdAt: '2023-01-10', matric: null              },
  { id: 5,  firstName: 'James',  lastName: 'Obi',        email: 'james@ful.edu.ng',   role: 'officer',   department: 'Bursary',            status: 'active',   createdAt: '2023-01-10', matric: null              },
  { id: 6,  firstName: 'Ngozi',  lastName: 'Bello',      email: 'ngozi@ful.edu.ng',   role: 'officer',   department: 'Hostel Affairs',     status: 'active',   createdAt: '2023-02-15', matric: null              },
  { id: 7,  firstName: 'Chidi',  lastName: 'Okafor',     email: 'chidi@ful.edu.ng',   role: 'student',   department: 'Mech. Eng.',         status: 'inactive', createdAt: '2024-09-03', matric: 'FUL/ME/2020/008' },
  { id: 8,  firstName: 'Amaka',  lastName: 'Obi',        email: 'amaka@ful.edu.ng',   role: 'officer',   department: 'Medical Centre',     status: 'active',   createdAt: '2023-03-01', matric: null              },
  { id: 9,  firstName: 'Segun',  lastName: 'Adeyemi',    email: 'segun@ful.edu.ng',   role: 'registrar', department: 'Registrar Office',   status: 'active',   createdAt: '2022-08-01', matric: null              },
  { id: 10, firstName: 'Kola',   lastName: 'Adesanya',   email: 'kola@ful.edu.ng',    role: 'admin',     department: 'ICT Unit',           status: 'active',   createdAt: '2022-01-01', matric: null              },
];

const roleBadge = {
  student:   'badge-info',
  officer:   'badge-warning',
  registrar: 'badge-primary',
  admin:     'badge-danger',
};

const roleLabel = {
  student:   'Student',
  officer:   'Officer',
  registrar: 'Registrar',
  admin:     'Admin',
};

const ROLE_OPTIONS = ['student', 'officer', 'registrar', 'admin'];

/* ── Add/Edit Modal ── */
const UserModal = ({ user, onClose, onSave }) => {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    firstName:  user?.firstName  ?? '',
    lastName:   user?.lastName   ?? '',
    email:      user?.email      ?? '',
    role:       user?.role       ?? 'student',
    department: user?.department ?? '',
    status:     user?.status     ?? 'active',
  });

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    onSave({ ...user, ...form });
    onClose();
    toast.success(isEdit ? 'User updated successfully.' : 'User created successfully.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit User' : 'Add New User'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">First Name <span className="required">*</span></label>
              <input className="form-input" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="First name" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name <span className="required">*</span></label>
              <input className="form-input" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Last name" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@ful.edu.ng" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Role <span className="required">*</span></label>
              <select className="form-select" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                {ROLE_OPTIONS.map(r => (
                  <option key={r} value={r}>{roleLabel[r]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Department / Unit</label>
            <input className="form-input" value={form.department} onChange={e => handleChange('department', e.target.value)} placeholder="e.g. Computer Science" />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ── Delete Confirm Modal ── */
const DeleteModal = ({ user, onClose, onConfirm }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">Delete User</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <p style={{ color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong>? This action cannot be undone.
        </p>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(user.id); onClose(); }}>
          <Trash2 size={14} /> Delete User
        </Button>
      </div>
    </div>
  </div>
);

const ManageUsers = () => {
  const [users,       setUsers]       = useState(mockUsers);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [showModal,   setShowModal]   = useState(false);
  const [editUser,    setEditUser]    = useState(null);
  const [deleteUser,  setDeleteUser]  = useState(null);

  const filtered = users.filter(u => {
    const matchSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.matric ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all:       users.length,
    student:   users.filter(u => u.role === 'student').length,
    officer:   users.filter(u => u.role === 'officer').length,
    registrar: users.filter(u => u.role === 'registrar').length,
    admin:     users.filter(u => u.role === 'admin').length,
  };

  const handleSave = (saved) => {
    if (saved.id) {
      setUsers(prev => prev.map(u => u.id === saved.id ? { ...u, ...saved } : u));
    } else {
      setUsers(prev => [...prev, { ...saved, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }]);
    }
  };

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User deleted.');
  };

  return (
    <DashboardLayout>

      {/* Modals */}
      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={handleSave}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{users.length} total users in the system</p>
        </div>
        <Button variant="primary" onClick={() => { setEditUser(null); setShowModal(true); }}>
          <UserPlus size={16} /> Add New User
        </Button>
      </div>

      {/* Role filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {['all', 'student', 'officer', 'registrar', 'admin'].map(f => (
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
            {f === 'all' ? 'All' : roleLabel[f]}
            <span style={{
              marginLeft: 6,
              background: roleFilter === f ? 'rgba(255,255,255,0.2)' : 'var(--color-gray-100)',
              color:      roleFilter === f ? 'white' : 'var(--color-gray-500)',
              padding: '1px 7px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
            }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div style={{ position: 'relative', maxWidth: 420 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              placeholder="Search by name, email or matric..."
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
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-gray-400)' }}>
                    No users found
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xs)',
                      }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-800)' }}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                          {user.matric ?? user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${roleBadge[user.role]}`}>
                      {roleLabel[user.role]}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)' }}>
                    {user.department}
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                        onClick={() => { setEditUser(user); setShowModal(true); }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Delete"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => setDeleteUser(user)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--color-gray-100)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
          Showing {filtered.length} of {users.length} users
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;