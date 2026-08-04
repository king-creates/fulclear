import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff, Mail, Lock, User, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthLayout from '../../component/layout/AuthLayout';
import { Button, Input, Alert } from '../../component/common';
import { registerSchema } from '../../utils/validators';
import api from '../../services/api';
import { ROUTES } from '../../constants/routes';
import { ACADEMIC_DEPARTMENTS } from '../../constants/academicDepartments';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const { confirmPassword, ...payload } = data;
      await api.post('/auth/register', payload);

      toast.success('Account created! Please check your email to verify.');
      navigate(ROUTES.VERIFY_EMAIL);

    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Create your account</h2>
        <p className="auth-form-subtitle">Join the FUL online clearance portal</p>
      </div>

      {serverError && (
        <Alert variant="danger" message={serverError} onClose={() => setServerError('')} />
      )}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 'var(--space-6)' }} noValidate>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input
            label="First Name"
            name="firstName"
            placeholder="Ada"
            required
            iconLeft={<User size={16} />}
            register={register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            name="lastName"
            placeholder="Okonkwo"
            required
            iconLeft={<User size={16} />}
            register={register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

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
          label="Matric Number"
          name="matricNumber"
          placeholder="FUL/CS/2020/001"
          required
          iconLeft={<Hash size={16} />}
          register={register('matricNumber')}
          error={errors.matricNumber?.message}
        />

        {/* Department select */}
        <div className="form-group">
          <label className="form-label" htmlFor="department">
            Department <span className="required">*</span>
          </label>
          <select
            id="department"
            className={`form-select ${errors.department ? 'error' : ''}`}
            {...register('department')}>
            <option value="">Select your department</option>
            {ACADEMIC_DEPARTMENTS.map(faculty => (<optgroup key={faculty.faculty} label={faculty.faculty}>
              {faculty.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </optgroup>
            ))}
          </select>
          {errors.department && <p className="form-error">{errors.department.message}</p>}
        </div>

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          required
          iconLeft={<Lock size={16} />}
          iconRight={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          onIconRightClick={() => setShowPassword(p => !p)}
          register={register('password')}
          error={errors.password?.message}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your password"
          required
          iconLeft={<Lock size={16} />}
          iconRight={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          onIconRightClick={() => setShowConfirm(p => !p)}
          register={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="auth-form-footer">
        <p>Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link></p>
      </div>
    </AuthLayout>
  );
};

export default Register;