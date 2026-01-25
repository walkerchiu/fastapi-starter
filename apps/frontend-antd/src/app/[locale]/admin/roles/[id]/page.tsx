'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';

import {
  PageHeader,
  PageContent,
  PageSection,
  ConfirmDialog,
} from '@/components/dashboard';
import { Badge } from '@/components/ui';
import {
  useRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
  useReplaceRolePermissions,
} from '@/hooks/api';
import { updateRoleSchema, type UpdateRoleInput } from '@/lib/validations';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  module?: string;
}

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params['id'] as string;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    new Set(),
  );

  const { data: role, isLoading, error } = useRole(roleId);
  const { data: permissionsData } = usePermissions({ limit: 100 });
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const replacePermissionsMutation = useReplaceRolePermissions();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateRoleInput>({
    resolver: zodResolver(updateRoleSchema),
  });

  // Reset form and permissions when role data is loaded
  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description ?? undefined,
      });
      setSelectedPermissions(
        new Set(role.permissions?.map((p: { id: number }) => p.id) || []),
      );
    }
  }, [role, reset]);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    if (permissionsData?.data) {
      (permissionsData.data as Permission[]).forEach((permission) => {
        const module = permission.module || 'General';
        if (!grouped[module]) {
          grouped[module] = [];
        }
        grouped[module].push(permission);
      });
    }
    return grouped;
  }, [permissionsData]);

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSelectAllInModule = (permissions: Permission[]) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => newSet.add(p.id));
      return newSet;
    });
  };

  const handleDeselectAllInModule = (permissions: Permission[]) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => newSet.delete(p.id));
      return newSet;
    });
  };

  const onSubmit = async (data: UpdateRoleInput) => {
    try {
      await updateRoleMutation.mutateAsync({ id: roleId, data });
      await replacePermissionsMutation.mutateAsync({
        id: roleId,
        data: { permissionIds: Array.from(selectedPermissions) },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoleMutation.mutateAsync(roleId);
      router.push('/admin/roles');
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedPermissions(
      new Set(role?.permissions?.map((p: { id: number }) => p.id) || []),
    );
    setIsEditing(false);
  };

  const hasPermissionChanges = useMemo(() => {
    if (!role?.permissions) return false;
    const originalIds = new Set(
      role.permissions.map((p: { id: number }) => p.id),
    );
    if (originalIds.size !== selectedPermissions.size) return true;
    for (const id of selectedPermissions) {
      if (!originalIds.has(id)) return true;
    }
    return false;
  }, [role?.permissions, selectedPermissions]);

  if (error) {
    return (
      <>
        <PageHeader
          title="Role Not Found"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Roles', href: '/admin/roles' },
            { label: 'Not Found' },
          ]}
        />
        <PageContent>
          <PageSection>
            <Card>
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Text type="secondary">
                  The role you are looking for could not be found.
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => router.push('/admin/roles')}
                  >
                    Back to Roles
                  </Button>
                </div>
              </div>
            </Card>
          </PageSection>
        </PageContent>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isLoading ? 'Loading...' : role?.name || 'Role Details'}
        description={isLoading ? '' : role?.code}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Roles', href: '/admin/roles' },
          { label: isLoading ? '...' : role?.name || 'Details' },
        ]}
        actions={
          !isLoading && (
            <Space>
              {isEditing ? (
                <>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={
                      (!isDirty && !hasPermissionChanges) ||
                      updateRoleMutation.isPending ||
                      replacePermissionsMutation.isPending
                    }
                    loading={
                      updateRoleMutation.isPending ||
                      replacePermissionsMutation.isPending
                    }
                  >
                    {updateRoleMutation.isPending ||
                    replacePermissionsMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button danger onClick={() => setDeleteModalOpen(true)}>
                    Delete
                  </Button>
                  <Button type="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </>
              )}
            </Space>
          )
        }
      />
      <PageContent>
        <Row gutter={24}>
          {/* Main content */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              <PageSection>
                <Card>
                  <Title level={5} style={{ marginBottom: 24 }}>
                    Role Information
                  </Title>
                  {isLoading ? (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size={16}
                    >
                      <Skeleton.Input active style={{ width: '100%' }} />
                      <Skeleton.Input active style={{ width: '100%' }} />
                      <Skeleton.Input
                        active
                        style={{ width: '100%', height: 80 }}
                      />
                    </Space>
                  ) : (
                    <Form layout="vertical">
                      <Form.Item
                        label="Role Name"
                        required
                        validateStatus={errors.name ? 'error' : undefined}
                        help={errors.name?.message}
                      >
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Enter role name"
                            />
                          )}
                        />
                      </Form.Item>

                      <Form.Item label="Role Code">
                        <Input
                          value={role?.code || ''}
                          disabled
                          style={{ backgroundColor: '#f5f5f5' }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Description"
                        validateStatus={
                          errors.description ? 'error' : undefined
                        }
                        help={errors.description?.message}
                      >
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <TextArea
                              {...field}
                              disabled={!isEditing}
                              placeholder="Enter role description"
                              rows={3}
                            />
                          )}
                        />
                      </Form.Item>
                    </Form>
                  )}
                </Card>
              </PageSection>

              {/* Permission Matrix */}
              <PageSection>
                <Card>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 24,
                    }}
                  >
                    <Title level={5} style={{ margin: 0 }}>
                      Permissions
                    </Title>
                    <Tag color="blue">{selectedPermissions.size} selected</Tag>
                  </div>
                  {isLoading ? (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size={16}
                    >
                      <Skeleton.Input
                        active
                        style={{ width: '100%', height: 100 }}
                      />
                      <Skeleton.Input
                        active
                        style={{ width: '100%', height: 100 }}
                      />
                    </Space>
                  ) : (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size={16}
                    >
                      {Object.entries(permissionsByModule).map(
                        ([module, permissions]) => {
                          const allSelected = permissions.every((p) =>
                            selectedPermissions.has(p.id),
                          );

                          return (
                            <Card
                              key={module}
                              size="small"
                              title={module}
                              extra={
                                isEditing && (
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() =>
                                      allSelected
                                        ? handleDeselectAllInModule(permissions)
                                        : handleSelectAllInModule(permissions)
                                    }
                                  >
                                    {allSelected
                                      ? 'Deselect All'
                                      : 'Select All'}
                                  </Button>
                                )
                              }
                            >
                              <Row gutter={[8, 8]}>
                                {permissions.map((permission) => (
                                  <Col xs={24} sm={12} key={permission.id}>
                                    <Card
                                      size="small"
                                      style={{
                                        cursor: isEditing
                                          ? 'pointer'
                                          : 'default',
                                        borderColor: selectedPermissions.has(
                                          permission.id,
                                        )
                                          ? '#1890ff'
                                          : undefined,
                                        backgroundColor:
                                          selectedPermissions.has(permission.id)
                                            ? '#e6f7ff'
                                            : undefined,
                                      }}
                                      onClick={() =>
                                        isEditing &&
                                        handlePermissionToggle(permission.id)
                                      }
                                    >
                                      <Space align="start">
                                        <Checkbox
                                          checked={selectedPermissions.has(
                                            permission.id,
                                          )}
                                          disabled={!isEditing}
                                          onChange={() =>
                                            handlePermissionToggle(
                                              permission.id,
                                            )
                                          }
                                        />
                                        <div>
                                          <Text strong>{permission.name}</Text>
                                          <Text
                                            type="secondary"
                                            style={{
                                              display: 'block',
                                              fontSize: 12,
                                            }}
                                          >
                                            {permission.code}
                                          </Text>
                                          {permission.description && (
                                            <Text
                                              type="secondary"
                                              style={{
                                                display: 'block',
                                                fontSize: 11,
                                                marginTop: 4,
                                              }}
                                            >
                                              {permission.description}
                                            </Text>
                                          )}
                                        </div>
                                      </Space>
                                    </Card>
                                  </Col>
                                ))}
                              </Row>
                            </Card>
                          );
                        },
                      )}

                      {Object.keys(permissionsByModule).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                          <Text type="secondary">No permissions available</Text>
                        </div>
                      )}
                    </Space>
                  )}
                </Card>
              </PageSection>
            </Space>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              <PageSection>
                <Card>
                  <Title level={5} style={{ marginBottom: 16 }}>
                    Role Statistics
                  </Title>
                  {isLoading ? (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size={12}
                    >
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 80 }}
                      />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 80 }}
                      />
                    </Space>
                  ) : (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size={12}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text type="secondary">Users with this role</Text>
                        <Badge variant="secondary">
                          {(role as { usersCount?: number } | undefined)
                            ?.usersCount || 0}
                        </Badge>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text type="secondary">Assigned permissions</Text>
                        <Badge variant="primary">
                          {role?.permissions?.length || 0}
                        </Badge>
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text type="secondary">Created</Text>
                        <Text>
                          {role?.createdAt
                            ? new Date(role.createdAt).toLocaleDateString()
                            : '-'}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text type="secondary">Updated</Text>
                        <Text>
                          {role?.updatedAt
                            ? new Date(role.updatedAt).toLocaleDateString()
                            : '-'}
                        </Text>
                      </div>
                    </Space>
                  )}
                </Card>
              </PageSection>

              <PageSection>
                <Card>
                  <Title level={5} style={{ marginBottom: 16 }}>
                    Current Permissions
                  </Title>
                  {isLoading ? (
                    <Skeleton.Input active style={{ width: '100%' }} />
                  ) : (
                    <Space wrap>
                      {(role?.permissions?.length ?? 0) > 0 ? (
                        role?.permissions?.map(
                          (permission: { id: number; name: string }) => (
                            <Badge key={permission.id} variant="secondary">
                              {permission.name}
                            </Badge>
                          ),
                        )
                      ) : (
                        <Text type="secondary">No permissions assigned</Text>
                      )}
                    </Space>
                  )}
                </Card>
              </PageSection>
            </Space>
          </Col>
        </Row>
      </PageContent>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        description={`Are you sure you want to delete ${role?.name}? This action cannot be undone and will remove this role from all users.`}
        confirmText={deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteRoleMutation.isPending}
      />
    </>
  );
}
