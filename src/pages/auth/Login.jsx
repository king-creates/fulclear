import { useState }          from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm }           from 'react-hook-form';
import { yupResolver }       from '@hookform/resolvers/yup';
import { useDispatch }       from 'react-redux';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast                 from 'react-hot-toast';

import AuthLayout            from '../../component/layout/AuthLayout';
import Button                from '../../component/common/Button';
import Input                 from '../../component/common/Input';
import Alert                 from '../../component/common/Alert';
import { loginSchema }       from '../../utils/validators';
import { loginUser }         from '../../store/slices/authSlice';
import { useAuth }           from '../../hooks/useAuth';
import { ROUTES }            from '../../constants/routes';

const Login = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { getDashboardRoute } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data) => {
  try {
    setServerError('');
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      const loggedInUser = result.payload.user;
      toast.success(`Welcome back, ${loggedInUser.firstName}!`);

      const dashboardByRole = {
        student:   '/student/dashboard',
        officer:   '/officer/dashboard',
        registrar: '/registrar/dashboard',
        admin:     '/admin/dashboard',
      };

      navigate(dashboardByRole[loggedInUser.role] || '/login');
    } else {
      setServerError(result.payload || 'Login failed. Please try again.');
    }
  } catch {
    setServerError('Something went wrong. Try again.');
  }
};
  return (
    <AuthLayout>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Welcome back</h2>
        <p className="auth-form-subtitle">Sign in to your clearance portal account</p>
      </div>

      {serverError && (
        <Alert
          variant="danger"
          message={serverError}
          onClose={() => setServerError('')}
        />
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 'var(--space-6)' }}
        noValidate
      >
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

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          required
          iconLeft={<Lock size={16} />}
          iconRight={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          onIconRightClick={() => setShowPassword(p => !p)}
          register={register('password')}
          error={errors.password?.message}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)', fontWeight: 'var(--font-medium)' }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <div className="auth-form-footer">
        <p>
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER}>Create one here</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;