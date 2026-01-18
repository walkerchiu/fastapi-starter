export const TEST_USERS = {
  user: {
    email: 'user@example.com',
    password: 'User123!@#',
    name: 'Test User',
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!@#',
    name: 'Admin User',
  },
  superAdmin: {
    email: 'superadmin@example.com',
    password: 'SuperAdmin123!@#',
    name: 'Super Admin',
  },
  newUser: {
    email: `newuser-${Date.now()}@example.com`,
    password: 'NewUser123!@#',
    name: 'New User',
  },
};

export const generateUniqueEmail = (prefix = 'test'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
};

export const generateValidPassword = (): string => {
  return 'Test123!@#';
};

export const TEST_CREDENTIALS = {
  validEmail: 'valid@example.com',
  validPassword: 'ValidPass123!@#',
  invalidEmail: 'invalid-email',
  weakPassword: '123',
  wrongPassword: 'WrongPass123!@#',
};

export const TEST_PROFILE_DATA = {
  updatedName: 'Updated Test User',
  updatedEmail: 'updated@example.com',
  newPassword: 'NewPass123!@#',
};

export const TEST_2FA = {
  validCode: '123456',
  invalidCode: '000000',
};

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  profile: '/profile',
  twoFactorSetup: '/2fa/setup',
  twoFactorVerify: '/2fa/verify',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  unauthorized: '/unauthorized',
};

export const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 30000,
};
