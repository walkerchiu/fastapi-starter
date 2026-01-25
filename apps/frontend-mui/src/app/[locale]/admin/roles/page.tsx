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
import SecurityIcon from '@mui/icons-material/Security';

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
import { useRoles, useDeleteRole } from '@/hooks/api';
import type { Role as ApiRole } from '@/hooks/api/types';

// Use ApiRole type
type Role = ApiRole;

export default function RolesPage() {
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
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Fetch roles with current filters
  const { data, isLoading, error } = useRoles({
    skip: (pagination.page - 1) * pagination.pageSize,
    limit: pagination.pageSize,
  });

  const deleteRoleMutation = useDeleteRole();

  // Update pagination when data changes
  const roles = useMemo(() => {
    if (data?.data) {
      setPagination((prev) => ({
        ...prev,
        total: data.meta?.total || data.data.length,
      }));
      return data.data as Role[];
    }
    return [];
  }, [data]);

  // Table columns
  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Role',
        sortable: true,
        cell: (row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <SecurityIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.code}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.description || '-'}
          </Typography>
        ),
      },
      {
        key: 'permissions',
        header: 'Permissions',
        cell: (row) => (
          <Chip
            label={`${row.permissions?.length || 0} permissions`}
            color="info"
            size="small"
          />
        ),
      },
      {
        key: 'usersCount',
        header: 'Users',
        cell: () => <Chip label="-" size="small" />,
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
                router.push(`/admin/roles/${row.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setRoleToDelete(row);
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

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRoleMutation.mutateAsync(String(roleToDelete.id));
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(selectedRows);
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) => deleteRoleMutation.mutateAsync(id)),
      );
      setSelectedRows({});
    } catch (err) {
      console.error('Failed to delete roles:', err);
    }
  };

  const selectedCount = Object.keys(selectedRows).length;

  return (
    <>
      <PageHeader
        title="Roles"
        description="Manage user roles and their permissions"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'User Management', href: '/admin/users' },
          { label: 'Roles' },
        ]}
        actions={
          <Link href="/admin/roles/new">
            <Button variant="contained" startIcon={<AddIcon />}>
              Add Role
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
                placeholder="Search roles..."
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
                    disabled={deleteRoleMutation.isPending}
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
                  Failed to load roles. Please try again.
                </Typography>
              </Paper>
            )}

            {/* Data table */}
            <DataTable
              columns={columns}
              data={roles}
              getRowKey={(row) => String(row.id)}
              loading={isLoading}
              sorting={sorting}
              onSortingChange={setSorting}
              pagination={pagination}
              onPaginationChange={setPagination}
              rowSelection={selectedRows}
              onRowSelectionChange={setSelectedRows}
              onRowClick={(row) => router.push(`/admin/roles/${row.id}`)}
              emptyState={
                <EmptyState
                  icon={<SecurityIcon />}
                  title="No roles found"
                  description="Get started by creating a new role."
                  action={
                    <Link href="/admin/roles/new">
                      <Button variant="contained">Add Role</Button>
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
          setRoleToDelete(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        description={`Are you sure you want to delete ${roleToDelete?.name}? This action cannot be undone and will remove this role from all users.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteRoleMutation.isPending}
      />
    </>
  );
}
