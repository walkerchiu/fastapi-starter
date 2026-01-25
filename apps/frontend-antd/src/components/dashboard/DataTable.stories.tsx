import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  DataTable,
  type ColumnDef,
  type PaginationState,
  type DataTableProps,
} from './DataTable';
import { DataTableToolbar } from './DataTableToolbar';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  avatar?: string;
}

const meta: Meta<DataTableProps<User>> = {
  title: 'Dashboard/Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<DataTableProps<User>>;

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-15',
    avatar: 'https://i.pravatar.cc/150?u=john',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    createdAt: '2024-01-10',
    avatar: 'https://i.pravatar.cc/150?u=jane',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'User',
    status: 'pending',
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Manager',
    status: 'inactive',
    createdAt: '2024-01-05',
    avatar: 'https://i.pravatar.cc/150?u=alice',
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: 'User',
    status: 'active',
    createdAt: '2024-01-25',
  },
];

const columns: ColumnDef<User>[] = [
  {
    key: 'name',
    header: 'User',
    sortable: true,
    cell: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar src={row.avatar} name={row.name} size="sm" />
        <div>
          <div style={{ fontWeight: 500 }}>{row.name}</div>
          <div style={{ fontSize: 14, color: '#666' }}>{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    cell: (row) => row.role,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    cell: (row) => {
      const variants = {
        active: 'success',
        inactive: 'error',
        pending: 'warning',
      } as const;
      return (
        <Badge variant={variants[row.status]}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      );
    },
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    cell: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export const Default: Story = {
  args: {
    columns,
    data: sampleUsers,
    getRowKey: (row) => row.id,
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    getRowKey: (row) => row.id,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    getRowKey: (row) => row.id,
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<Record<string, boolean>>({});

    return (
      <DataTable<User>
        columns={columns}
        data={sampleUsers}
        getRowKey={(row) => row.id}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
      />
    );
  },
};

export const WithPagination: Story = {
  render: () => {
    const [pagination, setPagination] = useState<PaginationState>({
      page: 1,
      pageSize: 2,
      total: sampleUsers.length,
    });

    const paginatedData = sampleUsers.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize,
    );

    return (
      <DataTable<User>
        columns={columns}
        data={paginatedData}
        getRowKey={(row) => row.id}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    );
  },
};

export const WithToolbar: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [selection, setSelection] = useState<Record<string, boolean>>({});

    const filteredData = sampleUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedCount = Object.keys(selection).length;

    return (
      <DataTable<User>
        columns={columns}
        data={filteredData}
        getRowKey={(row) => row.id}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        toolbar={
          <DataTableToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search users..."
            selectedCount={selectedCount}
            bulkActions={[
              {
                key: 'delete',
                label: 'Delete',
                variant: 'danger',
                onClick: () => {
                  alert(`Deleting ${selectedCount} users`);
                  setSelection({});
                },
              },
            ]}
            actions={<Button>Add User</Button>}
          />
        }
      />
    );
  },
};

export const WithRowClick: Story = {
  render: () => {
    return (
      <DataTable<User>
        columns={columns}
        data={sampleUsers}
        getRowKey={(row) => row.id}
        onRowClick={(row) => alert(`Clicked on ${row.name}`)}
      />
    );
  },
};

export const FullExample: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [selection, setSelection] = useState<Record<string, boolean>>({});
    const [pagination, setPagination] = useState<PaginationState>({
      page: 1,
      pageSize: 3,
      total: 0,
    });

    const filteredData = sampleUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()),
    );

    const total = filteredData.length;
    const paginatedData = filteredData.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize,
    );

    const selectedCount = Object.keys(selection).length;

    const columnsWithActions: ColumnDef<User>[] = [
      ...columns,
      {
        key: 'actions',
        header: '',
        width: 100,
        cell: (row) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                alert(`Edit ${row.name}`);
              }}
            >
              Edit
            </Button>
          </div>
        ),
      },
    ];

    return (
      <DataTable<User>
        columns={columnsWithActions}
        data={paginatedData}
        getRowKey={(row) => row.id}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        pagination={{ ...pagination, total }}
        onPaginationChange={(p) => {
          setPagination(p);
          setSelection({});
        }}
        onRowClick={(row) => alert(`View ${row.name}`)}
        toolbar={
          <DataTableToolbar
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            searchPlaceholder="Search users..."
            selectedCount={selectedCount}
            bulkActions={[
              {
                key: 'delete',
                label: 'Delete',
                variant: 'danger',
                onClick: () => {
                  alert(`Deleting ${selectedCount} users`);
                  setSelection({});
                },
              },
            ]}
            actions={<Button>Add User</Button>}
          />
        }
      />
    );
  },
};
