import * as yup from 'yup';

export const loginSchema = yup.object({
  email:    yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const registerSchema = yup.object({
  firstName:    yup.string().required('First name is required'),
  lastName:     yup.string().required('Last name is required'),
  email:        yup.string().email('Enter a valid email').required('Email is required'),
  matricNumber: yup.string().required('Matric number is required'),
  department:   yup.string().required('Department is required'),
  password:     yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});