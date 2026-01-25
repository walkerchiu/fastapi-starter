'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, Button, Input, Space, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

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
import { useRoles, useDeleteRole } from '@/hooks/api';

const { Text } = Typography;

interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  usersCount?: number;
  permissions?: Array<{ id: number; name: string }>;
  createdAt: string;
}

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
          <Space>
            <Avatar
              size="small"
              icon={<SafetyCertificateOutlined />}
              style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
            />
            <div>
              <Text strong style={{ display: 'block' }}>
                {row.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {row.code}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        cell: (row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {row.description || '-'}
          </Text>
        ),
      },
      {
        key: 'permissions',
        header: 'Permissions',
        cell: (row) => (
          <Tag color="blue">{row.permissions?.length || 0} permissions</Tag>
        ),
      },
      {
        key: 'usersCount',
        header: 'Users',
        cell: (row) => <Tag>{row.usersCount || 0} users</Tag>,
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
                router.push(`/admin/roles/${row.id}`);
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
                setRoleToDelete(row);
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
        selectedIds.map((id) => deleteRoleMutation.mutateAsync(String(id))),
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
            <Button type="primary" icon={<PlusOutlined />}>
              Add Role
            </Button>
          </Link>
        }
      />
      <PageContent>
        <PageSection>
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
                  placeholder="Search roles..."
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
                      loading={deleteRoleMutation.isPending}
                    >
                      Delete Selected
                    </Button>
                  </Space>
                )}
              </div>
            }
            emptyState={
              <EmptyState
                icon={
                  <SafetyCertificateOutlined
                    style={{ fontSize: 48, color: '#999' }}
                  />
                }
                title="No roles found"
                description="Get started by creating a new role."
                action={
                  <Link href="/admin/roles/new">
                    <Button type="primary">Add Role</Button>
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
              <Text type="danger">Failed to load roles. Please try again.</Text>
            </div>
          )}
        </PageSection>
      </PageContent>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        description={`Are you sure you want to delete ${roleToDelete?.name}? This action cannot be undone and will remove this role from all users.`}
        confirmText={deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteRoleMutation.isPending}
      />
    </>
  );
}
