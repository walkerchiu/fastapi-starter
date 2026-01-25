import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTable, type ColumnDef, type PaginationState } from './DataTable';
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

const meta: Meta<typeof DataTable<User>> = {
  title: 'Dashboard/Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<User>>;

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
      <div className="flex items-center gap-3">
        <Avatar src={row.avatar} alt={row.name} name={row.name} size="sm" />
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.email}
          </div>
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
    getRowKey: (row: User) => row.id,
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    getRowKey: (row: User) => row.id,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    getRowKey: (row: User) => row.id,
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<Record<string, boolean>>({});

    return (
      <DataTable
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
      <DataTable
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
      <DataTable
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
      <DataTable
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

    return (
      <DataTable
        columns={[
          ...columns,
          {
            key: 'actions',
            header: '',
            width: 100,
            cell: (row) => (
              <div className="flex justify-end gap-2">
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
        ]}
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
