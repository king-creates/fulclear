import { GraduationCap, CheckCircle } from 'lucide-react';

const features = [
  'Submit clearance applications online',
  'Upload and manage required documents',
  'Track clearance progress in real time',
  'Download your clearance certificate',
];

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">

      {/* Left — Brand Panel */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <GraduationCap size={80} color="#fbbf24" />
        </div>

        <h1 className="auth-brand-name">FUL Clearance</h1>
        <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', marginTop: '-8px', letterSpacing: '0.1em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
          Federal University Lokoja
        </p>

        <div className="auth-brand-divider" />

        <p className="auth-brand-tagline">
          A modern, secure platform for managing your student clearance process from start to finish.
        </p>

        <ul style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.75)' }}>
              <CheckCircle size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>

        <p style={{ marginTop: 'auto', paddingTop: 'var(--space-8)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)', position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} Federal University Lokoja. All rights reserved.
        </p>
      </div>

      {/* Right — Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;