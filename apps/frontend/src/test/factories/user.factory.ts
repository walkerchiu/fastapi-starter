import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles?: Role[];
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
}

export const userFactory = Factory.define<User>(({ sequence }) => ({
  id: faker.string.uuid(),
  email: `user${sequence}@example.com`,
  name: faker.person.fullName(),
  isActive: true,
  isEmailVerified: true,
  isTwoFactorEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
}));

export const unverifiedUserFactory = userFactory.params({
  isEmailVerified: false,
});

export const inactiveUserFactory = userFactory.params({
  isActive: false,
});

export const userWith2faFactory = userFactory.params({
  isTwoFactorEnabled: true,
});

export const adminUserFactory = userFactory.associations({
  roles: [
    {
      id: 2,
      code: 'admin',
      name: 'Admin',
      description: 'Administrator',
      isSystem: true,
    },
  ],
});

export const superAdminUserFactory = userFactory.associations({
  roles: [
    {
      id: 1,
      code: 'super_admin',
      name: 'Super Admin',
      description: 'Super Administrator',
      isSystem: true,
    },
  ],
});
