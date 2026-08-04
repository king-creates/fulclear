import { useState }      from 'react';
import { Bell, CheckCheck, Trash2, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import DashboardLayout   from '../../component/layout/DashboardLayout';
import { Button }        from '../../component/common';
import { timeAgo }       from '../../utils/formatDate';

const mockNotifications = [
  { id: 1, type: 'success', title: 'Library Clearance Approved',    message: 'Your library clearance has been approved by Mrs. Adaeze Eze.',       time: new Date(Date.now() - 2*3600*1000).toISOString(), read: false },
  { id: 2, type: 'success', title: 'Bursary Clearance Approved',    message: 'Your bursary fees clearance has been approved.',                      time: new Date(Date.now() - 26*3600*1000).toISOString(), read: false },
  { id: 3, type: 'info',    title: 'Document Upload Reminder',       message: 'Please upload your hostel clearance form to proceed.',                time: new Date(Date.now() - 48*3600*1000).toISOString(), read: true  },
  { id: 4, type: 'warning', title: 'Action Required',               message: 'Hostel clearance is awaiting your document. Upload to continue.',      time: new Date(Date.now() - 72*3600*1000).toISOString(), read: true  },
  { id: 5, type: 'danger',  title: 'Clearance Step Rejected',       message: 'Your sports clearance was rejected. Reason: Outstanding sports fees.',  time: new Date(Date.now() - 96*3600*1000).toISOString(), read: true  },
];

const typeIcon = { success: <CheckCircle size={18} />, info: <Info size={18} />, warning: <AlertTriangle size={18} />, danger: <XCircle size={18} /> };
const typeColor = { success: 'var(--color-success)', info: 'var(--color-info)', warning: 'var(--color-warning)', danger: 'var(--color-danger)' };
const typeBg    = { success: 'var(--color-success-light)', info: 'var(--color-info-light)', warning: 'var(--color-warning-light)', danger: 'var(--color-danger-light)' };

const Notifications = () => {
  const [items,  setItems]  = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const deleteItem  = (id) => setItems(prev => prev.filter(n => n.id !== id));
  const markRead    = (id) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const filtered = filter === 'all'    ? items
                 : filter === 'unread' ? items.filter(n => !n.read)
                 : items.filter(n => n.read);

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {['all', 'unread', 'read'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              borderColor: filter === f ? 'var(--color-primary-700)' : 'var(--color-gray-200)',
              background:  filter === f ? 'var(--color-primary-700)' : 'var(--color-white)',
              color:       filter === f ? 'white' : 'var(--color-gray-600)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
            <Bell size={40} color="var(--color-gray-300)" style={{ margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-gray-500)' }}>No notifications here</p>
          </div>
        ) : (
          filtered.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                background: n.read ? 'transparent' : 'var(--color-primary-50)',
                transition: 'background var(--transition-fast)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: typeBg[n.type],
                color: typeColor[n.type],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {typeIcon[n.type]}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: n.read ? 'var(--font-regular)' : 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>
                    {n.title}
                  </p>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', whiteSpace: 'nowrap' }}>
                    {timeAgo(n.time)}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginTop: 2, lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    title="Mark as read"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-700)', padding: 6, borderRadius: 'var(--radius)' }}
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => deleteItem(n.id)}
                  title="Delete"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: 6, borderRadius: 'var(--radius)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;