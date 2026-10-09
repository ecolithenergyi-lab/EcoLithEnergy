const { z } = require('zod');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(120),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128)
});

const customerSignupSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address').max(120),
  phone: z.string().trim()
    .min(10, 'Phone number must be at least 10 characters')
    .max(15, 'Phone number must be at most 15 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
    .regex(passwordPattern, 'Password must contain uppercase, lowercase, number and a special character.'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters').max(128)
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.'
});

const customerLoginSchema = loginSchema;

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(120)
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is missing or invalid'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
    .regex(passwordPattern, 'Password must contain uppercase, lowercase, number and a special character.')
});

const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
  profileImage: z.string().url().or(z.literal('')).optional(),
  addresses: z.array(z.object({
    type: z.string().optional(),
    label: z.string().optional(),
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  })).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(128).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
    .regex(passwordPattern, 'Password must contain uppercase, lowercase, number and a special character.'),
  confirmPassword: z.string().min(8).max(128)
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.'
});

const googleAuthSchema = z.object({
  credential: z.string().min(10)
}).strict();

const adminCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').max(120),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).default('ADMIN')
});

const adminUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(120).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).optional(),
  isActive: z.boolean().optional()
});

module.exports = {
  loginSchema,
  customerSignupSchema,
  customerLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  changePasswordSchema,
  googleAuthSchema,
  adminCreateSchema,
  adminUpdateSchema
};
