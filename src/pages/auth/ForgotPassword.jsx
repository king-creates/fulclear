import { useState }    from 'react';
import { Link }        from 'react-router-dom';
import { useForm }     from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast           from 'react-hot-toast';

import AuthLayout      from '../../component/layout/AuthLayout';
import { Button, Input, Alert } from '../../component/common';
import { forgotPasswordSchema } from '../../utils/validators';
import api             from '../../services/api';
import { ROUTES }      from '../../constants/routes';

const ForgotPassword = () => {
  const [submitted,   setSubmitted]   = useState(false);
  const [serverError, setServerError] = useState('');
  const [email,       setEmail]       = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await api.post('/auth/forgot-password', data);
      setEmail(data.email);
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  if (submitted) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-success-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-5)',
          }}>
            <CheckCircle size={36} color="var(--color-success)" />
          </div>
          <h2 className="auth-form-title">Email sent!</h2>
          <p className="auth-form-subtitle" style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button variant="primary" block size="lg">
              Back to Sign In
            </Button>
          </Link>
          <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
            Didn't receive it? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
            >
              try again
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Reset your password</h2>
        <p className="auth-form-subtitle">
          Enter your registered email and we'll send you a reset link.
        </p>
      </div>

      {serverError && (
        <Alert variant="danger" message={serverError} onClose={() => setServerError('')} />
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 'var(--space-6)' }} noValidate>
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@ful.edu.ng"
          required
          iconLeft={<Mail size={16} />}
          register={register('email')}
          error={errors.email?.message}
        />

        <Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
          Send Reset Link
        </Button>
      </form>

      <div className="auth-form-footer">
        <Link
          to={ROUTES.LOGIN}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)' }}
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;