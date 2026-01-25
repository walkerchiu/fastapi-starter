'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@/components/dashboard';
import { Badge, Button, Card, CardBody, Input, Modal } from '@/components/ui';
import { useRoles, useDeleteRole } from '@/hooks/api';
import type { Role } from '@/hooks/api/types';

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
      return data.data;
    }
    return [] as Role[];
  }, [data]);

  // Table columns
  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Role',
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {row.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {row.code}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        cell: (row) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {row.description || '-'}
          </span>
        ),
      },
      {
        key: 'permissions',
        header: 'Permissions',
        cell: (row) => (
          <Badge variant="info" size="sm">
            {row.permissions?.length || 0} permissions
          </Badge>
        ),
      },
      {
        key: 'usersCount',
        header: 'Users',
        cell: () => (
          <Badge variant="neutral" size="sm">
            - users
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        cell: (row) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        cell: (row) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/roles/${row.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setRoleToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
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
            <Button variant="primary">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Role
            </Button>
          </Link>
        }
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardBody>
              {/* Toolbar */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <Input
                    type="search"
                    placeholder="Search roles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                {selectedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedCount} selected
                    </span>
                    <Button
                      variant="danger"
                      onClick={handleBulkDelete}
                      disabled={deleteRoleMutation.isPending}
                    >
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>

              {/* Error state */}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Failed to load roles. Please try again.
                  </p>
                </div>
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
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No roles found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating a new role.
                    </p>
                    <div className="mt-6">
                      <Link href="/admin/roles/new">
                        <Button variant="primary">Add Role</Button>
                      </Link>
                    </div>
                  </div>
                }
              />
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        title="Delete Role"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {roleToDelete?.name}
            </span>
            ? This action cannot be undone and will remove this role from all
            users.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setRoleToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteRole}
            disabled={deleteRoleMutation.isPending}
          >
            {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
