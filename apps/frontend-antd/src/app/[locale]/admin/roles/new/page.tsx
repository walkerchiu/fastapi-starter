'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Badge } from '@/components/ui';
import {
  useCreateRole,
  usePermissions,
  useReplaceRolePermissions,
} from '@/hooks/api';
import { createRoleSchema, type CreateRoleInput } from '@/lib/validations';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface LocalPermission {
  id: number;
  name: string;
  code: string;
  description?: string;
  module?: string;
}

export default function NewRolePage() {
  const router = useRouter();
  const createRoleMutation = useCreateRole();
  const replacePermissionsMutation = useReplaceRolePermissions();
  const { data: permissionsData, isLoading: permissionsLoading } =
    usePermissions({
      limit: 100,
    });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    new Set(),
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      permissionIds: [],
    },
  });

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, LocalPermission[]> = {};
    if (permissionsData?.data) {
      (permissionsData.data as LocalPermission[]).forEach(
        (permission: LocalPermission) => {
          const module = permission.module || 'General';
          if (!grouped[module]) {
            grouped[module] = [];
          }
          grouped[module].push(permission);
        },
      );
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

  const handleSelectAllInModule = (permissions: LocalPermission[]) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => newSet.add(p.id));
      return newSet;
    });
  };

  const handleDeselectAllInModule = (permissions: LocalPermission[]) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => newSet.delete(p.id));
      return newSet;
    });
  };

  const onSubmit = async (data: CreateRoleInput) => {
    try {
      const createdRole = await createRoleMutation.mutateAsync({
        code: data.code,
        name: data.name,
        description: data.description,
      });
      if (selectedPermissions.size > 0 && createdRole?.id) {
        await replacePermissionsMutation.mutateAsync({
          id: String(createdRole.id),
          data: { permissionIds: Array.from(selectedPermissions) },
        });
      }
      router.push('/admin/roles');
    } catch (err) {
      console.error('Failed to create role:', err);
    }
  };

  return (
    <>
      <PageHeader
        title="Create Role"
        description="Add a new role with permissions"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Roles', href: '/admin/roles' },
          { label: 'Create Role' },
        ]}
        actions={
          <Space>
            <Button onClick={() => router.back()}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting || createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </Space>
        }
      />
      <PageContent>
        <Row gutter={24}>
          {/* Main content */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              <PageSection>
                <Card>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    Role Information
                  </Title>
                  <Text
                    type="secondary"
                    style={{ display: 'block', marginBottom: 24 }}
                  >
                    Enter the details for the new role.
                  </Text>

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
                          <Input {...field} placeholder="Enter role name" />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Role Code"
                      required
                      validateStatus={errors.code ? 'error' : undefined}
                      help={
                        errors.code?.message ||
                        'Unique identifier (lowercase letters, numbers, and underscores only)'
                      }
                    >
                      <Controller
                        name="code"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="e.g., content_editor"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Description"
                      validateStatus={errors.description ? 'error' : undefined}
                      help={errors.description?.message}
                    >
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextArea
                            {...field}
                            placeholder="Enter role description"
                            rows={3}
                          />
                        )}
                      />
                    </Form.Item>

                    {createRoleMutation.isError && (
                      <Alert
                        type="error"
                        message="Failed to create role. Please try again."
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </Form>
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
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        Permissions
                      </Title>
                      <Text type="secondary">
                        Select the permissions for this role.
                      </Text>
                    </div>
                    <Tag color="blue">{selectedPermissions.size} selected</Tag>
                  </div>

                  {permissionsLoading ? (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size={16}
                    >
                      <Card loading size="small" style={{ height: 100 }} />
                      <Card loading size="small" style={{ height: 100 }} />
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
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() =>
                                    allSelected
                                      ? handleDeselectAllInModule(permissions)
                                      : handleSelectAllInModule(permissions)
                                  }
                                >
                                  {allSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                              }
                            >
                              <Row gutter={[8, 8]}>
                                {permissions.map((permission) => (
                                  <Col xs={24} sm={12} key={permission.id}>
                                    <Card
                                      size="small"
                                      style={{
                                        cursor: 'pointer',
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
                                        handlePermissionToggle(permission.id)
                                      }
                                    >
                                      <Space align="start">
                                        <Checkbox
                                          checked={selectedPermissions.has(
                                            permission.id,
                                          )}
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
            <PageSection>
              <Card>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Summary
                </Title>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text type="secondary">Selected permissions</Text>
                    <Tag color="blue">{selectedPermissions.size}</Tag>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: 16,
                      marginTop: 4,
                    }}
                  >
                    <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>
                      Selected Permissions:
                    </Title>
                    {selectedPermissions.size > 0 ? (
                      <Space wrap>
                        {(
                          permissionsData?.data as LocalPermission[] | undefined
                        )
                          ?.filter((p: LocalPermission) =>
                            selectedPermissions.has(p.id),
                          )
                          .map((p: LocalPermission) => (
                            <Badge key={p.id} variant="secondary">
                              {p.name}
                            </Badge>
                          ))}
                      </Space>
                    ) : (
                      <Text type="secondary">No permissions selected</Text>
                    )}
                  </div>
                </Space>
              </Card>
            </PageSection>
          </Col>
        </Row>
      </PageContent>
    </>
  );
}
