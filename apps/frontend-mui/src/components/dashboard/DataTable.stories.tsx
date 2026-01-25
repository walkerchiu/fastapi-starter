import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  DataTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from './DataTable';
import { DataTableToolbar, type BulkAction } from './DataTableToolbar';
import { Box, Chip, Avatar, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddIcon from '@mui/icons-material/Add';

const meta: Meta<typeof DataTable> = {
  title: 'Dashboard/DataDisplay/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<User>>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const roles = ['Admin', 'User', 'Editor', 'Viewer'] as const;
const statuses = ['active', 'inactive', 'pending'] as const;

const users: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: roles[i % 4] as string,
  status: statuses[i % 3] as 'active' | 'inactive' | 'pending',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const columns: ColumnDef<User>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
          {row.name.charAt(0)}
        </Avatar>
        <Typography variant="body2">{row.name}</Typography>
      </Box>
    ),
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    cell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {row.email}
      </Typography>
    ),
    sortable: true,
  },
  {
    key: 'role',
    header: 'Role',
    cell: (row) => <Chip label={row.role} size="small" variant="outlined" />,
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => {
      const colorMap = {
        active: 'success',
        inactive: 'default',
        pending: 'warning',
      } as const;
      return (
        <Chip
          label={row.status}
          size="small"
          color={colorMap[row.status]}
          sx={{ textTransform: 'capitalize' }}
        />
      );
    },
    sortable: true,
  },
  {
    key: 'createdAt',
    header: 'Created',
    cell: (row) => (
      <Typography variant="body2" color="text.secondary">
        {new Date(row.createdAt).toLocaleDateString()}
      </Typography>
    ),
    sortable: true,
  },
];

export const Default: Story = {
  args: {
    columns,
    data: users.slice(0, 10),
    getRowKey: (row: User) => row.id,
  },
};

export const WithSorting: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState | undefined>();
    const [data, setData] = useState(users.slice(0, 10));

    const handleSortingChange = (newSorting: SortingState | undefined) => {
      setSorting(newSorting);
      if (newSorting) {
        const sorted = [...users.slice(0, 10)].sort((a, b) => {
          const aVal = a[newSorting.key as keyof User];
          const bVal = b[newSorting.key as keyof User];
          const cmp = String(aVal).localeCompare(String(bVal));
          return newSorting.direction === 'asc' ? cmp : -cmp;
        });
        setData(sorted);
      } else {
        setData(users.slice(0, 10));
      }
    };

    return (
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
        sorting={sorting}
        onSortingChange={handleSortingChange}
      />
    );
  },
};

export const WithPagination: Story = {
  render: () => {
    const [pagination, setPagination] = useState<PaginationState>({
      page: 1,
      pageSize: 10,
      total: users.length,
    });

    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const paginatedData = users.slice(
      startIndex,
      startIndex + pagination.pageSize,
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

export const WithSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<Record<string, boolean>>({});

    return (
      <Box>
        <DataTable
          columns={columns}
          data={users.slice(0, 10)}
          getRowKey={(row) => row.id}
          rowSelection={selection}
          onRowSelectionChange={setSelection}
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Selected: {Object.keys(selection).join(', ') || 'None'}
          </Typography>
        </Box>
      </Box>
    );
  },
};

export const WithRowClick: Story = {
  render: () => {
    const [clicked, setClicked] = useState<User | null>(null);

    return (
      <Box>
        <DataTable
          columns={columns}
          data={users.slice(0, 10)}
          getRowKey={(row) => row.id}
          onRowClick={setClicked}
        />
        {clicked && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Clicked: {clicked.name} ({clicked.email})
            </Typography>
          </Box>
        )}
      </Box>
    );
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

export const WithToolbar: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [selection, setSelection] = useState<Record<string, boolean>>({});
    const [pagination, setPagination] = useState<PaginationState>({
      page: 1,
      pageSize: 10,
      total: users.length,
    });

    const bulkActions: BulkAction[] = [
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteIcon fontSize="small" />,
        variant: 'danger',
        onClick: () => setSelection({}),
      },
      {
        key: 'archive',
        label: 'Archive',
        icon: <ArchiveIcon fontSize="small" />,
        variant: 'ghost',
        onClick: () => setSelection({}),
      },
    ];

    const filteredUsers = searchValue
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            u.email.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : users;

    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const paginatedData = filteredUsers.slice(
      startIndex,
      startIndex + pagination.pageSize,
    );

    return (
      <DataTable
        columns={columns}
        data={paginatedData}
        getRowKey={(row) => row.id}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        pagination={{ ...pagination, total: filteredUsers.length }}
        onPaginationChange={setPagination}
        toolbar={
          <DataTableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search users..."
            selectedCount={Object.keys(selection).length}
            bulkActions={bulkActions}
            actions={
              <Button variant="contained" size="small" startIcon={<AddIcon />}>
                Add User
              </Button>
            }
          />
        }
      />
    );
  },
};

export const FullFeatures: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [selection, setSelection] = useState<Record<string, boolean>>({});
    const [sorting, setSorting] = useState<SortingState | undefined>();
    const [pagination, setPagination] = useState<PaginationState>({
      page: 1,
      pageSize: 10,
      total: users.length,
    });

    const bulkActions: BulkAction[] = [
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteIcon fontSize="small" />,
        variant: 'danger',
        onClick: () => setSelection({}),
      },
      {
        key: 'archive',
        label: 'Archive',
        icon: <ArchiveIcon fontSize="small" />,
        variant: 'ghost',
        onClick: () => setSelection({}),
      },
    ];

    let filteredUsers = searchValue
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            u.email.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : users;

    if (sorting) {
      filteredUsers = [...filteredUsers].sort((a, b) => {
        const aVal = a[sorting.key as keyof User];
        const bVal = b[sorting.key as keyof User];
        const cmp = String(aVal).localeCompare(String(bVal));
        return sorting.direction === 'asc' ? cmp : -cmp;
      });
    }

    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const paginatedData = filteredUsers.slice(
      startIndex,
      startIndex + pagination.pageSize,
    );

    return (
      <DataTable
        columns={columns}
        data={paginatedData}
        getRowKey={(row) => row.id}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={{ ...pagination, total: filteredUsers.length }}
        onPaginationChange={setPagination}
        toolbar={
          <DataTableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Search users..."
            selectedCount={Object.keys(selection).length}
            bulkActions={bulkActions}
            actions={
              <Button variant="contained" size="small" startIcon={<AddIcon />}>
                Add User
              </Button>
            }
          />
        }
      />
    );
  },
};
