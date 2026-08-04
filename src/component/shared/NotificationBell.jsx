import { useState }        from 'react';
import { Bell }            from 'lucide-react';
import { useSelector }     from 'react-redux';

const NotificationBell = () => {
  const unread = useSelector(s => s.notifications.unread);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 'var(--space-2)',
          borderRadius: 'var(--radius)', color: 'var(--color-gray-500)',
        }}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-danger)',
            border: '2px solid var(--color-white)',
          }} />
        )}
      </button>
    </div>
  );
};

export default NotificationBell;