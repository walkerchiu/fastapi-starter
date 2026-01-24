import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export const roleFactory = Factory.define<Role>(({ sequence }) => ({
  id: sequence,
  code: faker.helpers.slugify(faker.word.noun()).toLowerCase(),
  name: faker.word.noun(),
  description: faker.lorem.sentence(),
  isSystem: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const systemRoleFactory = roleFactory.params({
  isSystem: true,
});

export const superAdminRoleFactory = roleFactory.params({
  code: 'super_admin',
  name: 'Super Admin',
  description: 'Super Administrator with full access',
  isSystem: true,
});

export const adminRoleFactory = roleFactory.params({
  code: 'admin',
  name: 'Admin',
  description: 'Administrator with limited access',
  isSystem: true,
});

export const userRoleFactory = roleFactory.params({
  code: 'user',
  name: 'User',
  description: 'Regular user',
  isSystem: true,
});
