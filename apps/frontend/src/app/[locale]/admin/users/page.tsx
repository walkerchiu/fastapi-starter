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
import { useUsers, useDeleteUser, type User } from '@/hooks/api';

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
        total: data.meta?.totalItems || data.data.length,
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
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {row.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {row.email}
            </span>
          </div>
        ),
      },
      {
        key: 'roles',
        header: 'Roles',
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.roles?.map((role) => (
              <Badge key={role.id} variant="neutral" size="sm">
                {role.name}
              </Badge>
            )) || (
              <span className="text-gray-400 dark:text-gray-500">No roles</span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => (
          <div className="flex flex-col gap-1">
            <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm">
              {row.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {row.isEmailVerified && (
              <Badge variant="info" size="sm">
                Verified
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: '2fa',
        header: '2FA',
        cell: (row) => (
          <Badge
            variant={row.isTwoFactorEnabled ? 'success' : 'warning'}
            size="sm"
          >
            {row.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
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
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/users/${row.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setUserToDelete(row);
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
              Add User
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
                    placeholder="Search users..."
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
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={deleteUserMutation.isPending}
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
                    Failed to load users. Please try again.
                  </p>
                </div>
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No users found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating a new user.
                    </p>
                    <div className="mt-6">
                      <Link href="/admin/users/new">
                        <Button variant="primary">Add User</Button>
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
          setUserToDelete(null);
        }}
        title="Delete User"
        size="sm"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {userToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setUserToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteUser}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
