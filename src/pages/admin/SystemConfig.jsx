import { useState }   from 'react';
import { Save, Settings, Bell, Shield, Mail, Database } from 'lucide-react';
import toast          from 'react-hot-toast';

import DashboardLayout from '../../component/layout/DashboardLayout';
import Button          from '../../component/common/Button';

const SystemConfig = () => {
  const [saving,  setSaving]  = useState(false);

  const [general, setGeneral] = useState({
    systemName:    'FUL Student Clearance System',
    sessionYear:   '2024/2025',
    maxFileSize:   '5',
    allowedTypes:  'pdf,jpg,jpeg,png',
    maintenanceMode: false,
  });

  const [notifications, setNotifications] = useState({
    emailOnSubmit:   true,
    emailOnApproval: true,
    emailOnRejection:true,
    emailOnComplete: true,
    adminDigest:     false,
  });

  const [security, setSecurity] = useState({
    sessionTimeout:  '60',
    maxLoginAttempts:'5',
    requireEmailVerification: true,
    twoFactorAuth:   false,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast.success('System configuration saved successfully.');
  };

  const Section = ({ icon, title, children }) => (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius)',
            background: 'var(--color-primary-50)', color: 'var(--color-primary-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
          <h2 className="card-title">{title}</h2>
        </div>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {children}
      </div>
    </div>
  );

  const Toggle = ({ label, hint, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-800)' }}>{label}</p>
        {hint && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 2 }}>{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 'var(--radius-full)', border: 'none',
          background: checked ? 'var(--color-primary-700)' : 'var(--color-gray-300)',
          cursor: 'pointer', position: 'relative', transition: 'background var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3,
          left: checked ? 23 : 3,
          transition: 'left var(--transition-fast)',
          boxShadow: 'var(--shadow-sm)',
        }} />
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">System Configuration</h1>
          <p className="page-subtitle">Manage global system settings</p>
        </div>
        <Button variant="primary" loading={saving} onClick={handleSave}>
          <Save size={16} /> Save All Changes
        </Button>
      </div>

      <div style={{ maxWidth: 800 }}>

        {/* General */}
        <Section icon={<Settings size={18} />} title="General Settings">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">System Name</label>
              <input className="form-input" value={general.systemName} onChange={e => setGeneral(p => ({ ...p, systemName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Current Academic Session</label>
              <select className="form-select" value={general.sessionYear} onChange={e => setGeneral(p => ({ ...p, sessionYear: e.target.value }))}>
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max File Upload Size (MB)</label>
              <input className="form-input" type="number" value={general.maxFileSize} onChange={e => setGeneral(p => ({ ...p, maxFileSize: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Allowed File Types</label>
              <input className="form-input" value={general.allowedTypes} onChange={e => setGeneral(p => ({ ...p, allowedTypes: e.target.value }))} />
              <p className="form-hint">Comma-separated list of extensions</p>
            </div>
          </div>
          <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-gray-100)' }}>
            <Toggle
              label="Maintenance Mode"
              hint="Prevents students from submitting new clearance requests"
              checked={general.maintenanceMode}
              onChange={v => setGeneral(p => ({ ...p, maintenanceMode: v }))}
            />
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={<Bell size={18} />} title="Email Notifications">
          {[
            { key: 'emailOnSubmit',    label: 'On Clearance Submission',  hint: 'Notify officers when a student submits a request'    },
            { key: 'emailOnApproval',  label: 'On Approval',              hint: 'Notify student when a department approves them'      },
            { key: 'emailOnRejection', label: 'On Rejection',             hint: 'Notify student when a department rejects them'       },
            { key: 'emailOnComplete',  label: 'On Final Clearance',       hint: 'Notify student when fully cleared by registrar'      },
            { key: 'adminDigest',      label: 'Daily Admin Digest',       hint: 'Send daily summary email to administrators'          },
          ].map(item => (
            <Toggle
              key={item.key}
              label={item.label}
              hint={item.hint}
              checked={notifications[item.key]}
              onChange={v => setNotifications(p => ({ ...p, [item.key]: v }))}
            />
          ))}
        </Section>

        {/* Security */}
        <Section icon={<Shield size={18} />} title="Security Settings">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Session Timeout (minutes)</label>
              <input className="form-input" type="number" value={security.sessionTimeout} onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Login Attempts</label>
              <input className="form-input" type="number" value={security.maxLoginAttempts} onChange={e => setSecurity(p => ({ ...p, maxLoginAttempts: e.target.value }))} />
              <p className="form-hint">Account locks after this many failed attempts</p>
            </div>
          </div>
          <Toggle
            label="Require Email Verification"
            hint="New students must verify their email before accessing the system"
            checked={security.requireEmailVerification}
            onChange={v => setSecurity(p => ({ ...p, requireEmailVerification: v }))}
          />
          <Toggle
            label="Two-Factor Authentication"
            hint="Require 2FA for officer and admin accounts"
            checked={security.twoFactorAuth}
            onChange={v => setSecurity(p => ({ ...p, twoFactorAuth: v }))}
          />
        </Section>

      </div>
    </DashboardLayout>
  );
};

export default SystemConfig;