import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';

const columns = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'email', title: 'Email', dataIndex: 'email' },
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'status', title: 'Status', dataIndex: 'status' },
];

const data = [
  {
    key: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    key: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
  },
  {
    key: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'Inactive',
  },
];

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    columns,
    data: data,
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: data,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: Array.from({ length: 50 }, (_, i) => ({
      key: String(i + 1),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 5 === 0 ? 'Admin' : 'User',
      status: i % 3 === 0 ? 'Inactive' : 'Active',
    })),
    pagination: {
      current: 1,
      pageSize: 10,
      total: 50,
      onChange: () => {},
    },
  },
};

export const Bordered: Story = {
  args: {
    columns,
    data: data,
    bordered: true,
  },
};
