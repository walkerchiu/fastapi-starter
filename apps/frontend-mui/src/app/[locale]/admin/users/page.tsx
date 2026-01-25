'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  ConfirmDialog,
  EmptyState,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@/components/dashboard';
import { Link } from '@/i18n/routing';
import { useUsers, useDeleteUser } from '@/hooks/api';
import type { User as ApiUser } from '@/hooks/api/types';

// Extend ApiUser for local page usage
type User = ApiUser;

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorting, setSorting] = useState<SortingState | undefined>();
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users with current filters
  const { data, isLoading, error } = useUsers({
    skip: (pagination.page - 1) * pagination.pageSize,
    limit: pagination.pageSize,
  });

  const deleteUserMutation = useDeleteUser();

  // Update pagination when data changes
  const users = useMemo(() => {
    if (data?.data) {
      setPagination((prev) => ({
        ...prev,
        total: data.meta?.total || data.data.length,
      }));
      return data.data as User[];
    }
    return [];
  }, [data]);

  // Table columns
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        cell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'roles',
        header: 'Roles',
        cell: (row) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {row.roles?.map((role) => (
              <Chip key={role.id} label={role.name} size="small" />
            )) || (
              <Typography variant="body2" color="text.secondary">
                No roles
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => (
          <Stack direction="column" spacing={0.5}>
            <Chip
              label={row.isActive ? 'Active' : 'Inactive'}
              color={row.isActive ? 'success' : 'default'}
              size="small"
            />
            {row.isEmailVerified && (
              <Chip label="Verified" color="info" size="small" />
            )}
          </Stack>
        ),
      },
      {
        key: '2fa',
        header: '2FA',
        cell: (row) => (
          <Chip
            label={row.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
            color={row.isTwoFactorEnabled ? 'success' : 'warning'}
            size="small"
          />
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {new Date(row.createdAt).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        key: 'actions',
        header: '',
        cell: (row) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/users/${row.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setUserToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [router],
  );

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(selectedRows);
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) => deleteUserMutation.mutateAsync(id)),
      );
      setSelectedRows({});
    } catch (err) {
      console.error('Failed to delete users:', err);
    }
  };

  const selectedCount = Object.keys(selectedRows).length;

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'User Management', href: '/admin/users' },
          { label: 'Users' },
        ]}
        actions={
          <Link href="/admin/users/new">
            <Button variant="contained" startIcon={<AddIcon />}>
              Add User
            </Button>
          </Link>
        }
      />
      <PageContent>
        <PageSection>
          <Paper sx={{ p: 3 }}>
            {/* Toolbar */}
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <TextField
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ maxWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {selectedCount > 0 && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {selectedCount} selected
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    disabled={deleteUserMutation.isPending}
                  >
                    Delete Selected
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Error state */}
            {error && (
              <Paper
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: 'error.lighter',
                  borderColor: 'error.light',
                }}
                variant="outlined"
              >
                <Typography variant="body2" color="error.main">
                  Failed to load users. Please try again.
                </Typography>
              </Paper>
            )}

            {/* Data table */}
            <DataTable
              columns={columns}
              data={users}
              getRowKey={(row) => row.id}
              loading={isLoading}
              sorting={sorting}
              onSortingChange={setSorting}
              pagination={pagination}
              onPaginationChange={setPagination}
              rowSelection={selectedRows}
              onRowSelectionChange={setSelectedRows}
              onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
              emptyState={
                <EmptyState
                  icon={<PeopleIcon />}
                  title="No users found"
                  description="Get started by creating a new user."
                  action={
                    <Link href="/admin/users/new">
                      <Button variant="contained">Add User</Button>
                    </Link>
                  }
                />
              }
            />
          </Paper>
        </PageSection>
      </PageContent>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteUserMutation.isPending}
      />
    </>
  );
}
