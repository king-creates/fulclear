import { useState }    from 'react';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle } from 'lucide-react';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';
import { timeAgo }     from '../../utils/formatDate';

const mockNotifications = [
  { id: 1, type: 'info',    title: 'New Clearance Request', message: 'Ada Okonkwo (FUL/CS/2020/001) submitted a clearance request.',    time: new Date(Date.now() - 1*3600*1000).toISOString(),  read: false },
  { id: 2, type: 'info',    title: 'New Clearance Request', message: 'Emeka Nwachukwu (FUL/EE/2020/014) submitted a clearance request.', time: new Date(Date.now() - 3*3600*1000).toISOString(),  read: false },
  { id: 3, type: 'warning', title: 'Overdue Review',        message: "Fatima Bello's request has been pending for over 48 hours.",       time: new Date(Date.now() - 6*3600*1000).toISOString(),  read: false },
  { id: 4, type: 'success', title: 'Approval Recorded',     message: "Your approval of Tunde Fashola's clearance has been recorded.",    time: new Date(Date.now() - 24*3600*1000).toISOString(), read: true  },
  { id: 5, type: 'success', title: 'Approval Recorded',     message: "Your approval of Kemi Adesanya's clearance has been recorded.",    time: new Date(Date.now() - 26*3600*1000).toISOString(), read: true  },
];

const typeIcon = {
  success: <CheckCircle   size={18} />,
  info:    <Info          size={18} />,
  warning: <AlertTriangle size={18} />,
};

const typeColor = {
  success: 'var(--color-success)',
  info:    'var(--color-info)',
  warning: 'var(--color-warning)',
};

const typeBg = {
  success: 'var(--color-success-light)',
  info:    'var(--color-info-light)',
  warning: 'var(--color-warning-light)',
};

const OfficerNotifications = () => {
  const [items,  setItems]  = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const filtered =
    filter === 'unread' ? items.filter(n => !n.read) :
    filter === 'read'   ? items.filter(n =>  n.read) :
    items;

  const unread = items.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread} unread</p>
        </div>
        {unread > 0 && (
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

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
            <Bell size={40} color="var(--color-gray-300)" style={{ margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-gray-500)' }}>No notifications</p>
          </div>
        ) : filtered.map((n, i) => (
          <div
            key={n.id}
            style={{
              display: 'flex', gap: 'var(--space-4)',
              padding: 'var(--space-4) var(--space-5)',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
              background: n.read ? 'transparent' : 'var(--color-primary-50)',
              transition: 'background var(--transition-fast)',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: typeBg[n.type], color: typeColor[n.type],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {typeIcon[n.type]}
            </div>

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

            {!n.read && (
              <button
                onClick={() => markRead(n.id)}
                title="Mark as read"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-700)', padding: 6, borderRadius: 'var(--radius)', flexShrink: 0 }}
              >
                <CheckCheck size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default OfficerNotifications;