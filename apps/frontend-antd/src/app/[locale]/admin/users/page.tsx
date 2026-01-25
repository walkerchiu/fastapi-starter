'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Space, Tag, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';

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
import { Badge } from '@/components/ui';
import { useUsers, useDeleteUser } from '@/hooks/api';

const { Text } = Typography;

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  roles?: Array<{ id: string; name: string }>;
}

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
      return data.data as unknown as User[];
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
          <div>
            <Text strong style={{ display: 'block' }}>
              {row.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.email}
            </Text>
          </div>
        ),
      },
      {
        key: 'roles',
        header: 'Roles',
        cell: (row) => (
          <Space size={4} wrap>
            {row.roles?.map((role) => <Tag key={role.id}>{role.name}</Tag>) || (
              <Text type="secondary">No roles</Text>
            )}
          </Space>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => (
          <Space direction="vertical" size={4}>
            <Badge variant={row.isActive ? 'success' : 'secondary'}>
              {row.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {row.emailVerified && <Badge variant="primary">Verified</Badge>}
          </Space>
        ),
      },
      {
        key: '2fa',
        header: '2FA',
        cell: (row) => (
          <Badge variant={row.twoFactorEnabled ? 'success' : 'warning'}>
            {row.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        cell: (row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {new Date(row.createdAt).toLocaleDateString()}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: 150,
        cell: (row) => (
          <Space>
            <Button
              type="text"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/users/${row.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              type="text"
              size="small"
              danger
              onClick={(e) => {
                e.stopPropagation();
                setUserToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </Space>
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
            <Button type="primary" icon={<PlusOutlined />}>
              Add User
            </Button>
          </Link>
        }
      />
      <PageContent>
        <PageSection>
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
            toolbar={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <Input
                  placeholder="Search users..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ maxWidth: 300 }}
                  allowClear
                />
                {selectedCount > 0 && (
                  <Space>
                    <Text type="secondary">{selectedCount} selected</Text>
                    <Button
                      danger
                      size="small"
                      onClick={handleBulkDelete}
                      loading={deleteUserMutation.isPending}
                    >
                      Delete Selected
                    </Button>
                  </Space>
                )}
              </div>
            }
            emptyState={
              <EmptyState
                icon={<UserOutlined style={{ fontSize: 48, color: '#999' }} />}
                title="No users found"
                description="Get started by creating a new user."
                action={
                  <Link href="/admin/users/new">
                    <Button type="primary">Add User</Button>
                  </Link>
                }
              />
            }
          />

          {/* Error state */}
          {error && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: '#fff2f0',
                borderRadius: 8,
              }}
            >
              <Text type="danger">Failed to load users. Please try again.</Text>
            </div>
          )}
        </PageSection>
      </PageContent>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText={deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteUserMutation.isPending}
      />
    </>
  );
}
