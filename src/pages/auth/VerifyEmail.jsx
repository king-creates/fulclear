import { useState }    from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MailCheck, RefreshCw } from 'lucide-react';
import toast           from 'react-hot-toast';

import AuthLayout      from '../../component/layout/AuthLayout';
import { Button, Alert } from '../../component/common';
import api             from '@services/api';
import { ROUTES }      from '@constants/routes';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [code,        setCode]        = useState(['', '', '', '', '', '']);
  const [loading,     setLoading]     = useState(false);
  const [resending,   setResending]   = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle each digit box
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...code];
    updated[index] = value;
    setCode(updated);

    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setServerError('Please enter the complete 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      setServerError('');
      await api.post('/auth/verify-email', { code: fullCode });
      toast.success('Email verified! Please log in.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await api.post('/auth/resend-verification');
      toast.success('A new code has been sent to your email.');
    } catch {
      toast.error('Failed to resend code. Try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--color-primary-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-5)',
        }}>
          <MailCheck size={36} color="var(--color-primary-700)" />
        </div>
        <h2 className="auth-form-title">Check your email</h2>
        <p className="auth-form-subtitle" style={{ marginTop: 'var(--space-2)' }}>
          We sent a 6-digit verification code to your email address. Enter it below to verify your account.
        </p>
      </div>

      {serverError && (
        <Alert variant="danger" message={serverError} onClose={() => setServerError('')} />
      )}

      {/* Code input boxes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', margin: 'var(--space-6) 0' }}>
        {code.map((digit, i) => (
          <input
            key={i}
            id={`code-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(e.target.value, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            style={{
              width: 48, height: 56,
              textAlign: 'center',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              border: '2px solid var(--color-gray-300)',
              borderRadius: 'var(--radius)',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
              color: 'var(--color-gray-900)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'}
            onBlur={e  => e.target.style.borderColor = 'var(--color-gray-300)'}
          />
        ))}
      </div>

      <Button type="button" variant="primary" size="lg" block loading={loading} onClick={handleVerify}>
        Verify Email
      </Button>

      <div className="auth-form-footer" style={{ marginTop: 'var(--space-5)' }}>
        <p>Didn't receive a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)', cursor: 'pointer', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            {resending ? <><RefreshCw size={12} className="animate-spin" /> Sending...</> : 'Resend code'}
          </button>
        </p>
        <p style={{ marginTop: 'var(--space-3)' }}>
          <Link to={ROUTES.LOGIN}>Back to sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;