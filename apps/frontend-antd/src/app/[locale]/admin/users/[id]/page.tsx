'use client';

import { useEffect, useState } from 'react';
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
  Typography,
} from 'antd';

import {
  PageHeader,
  PageContent,
  PageSection,
  ConfirmDialog,
} from '@/components/dashboard';
import { Badge } from '@/components/ui';
import { useUser, useUpdateUser, useDeleteUser, useRoles } from '@/hooks/api';
import { updateUserSchema, type UpdateUserInput } from '@/lib/validations';

const { Text, Title } = Typography;

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params['id'] as string;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading, error } = useUser(userId);
  const { data: rolesData } = useRoles({ limit: 100 });
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  // Reset form when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        roleIds: user.roles?.map((r: { id: number }) => String(r.id)) || [],
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, data });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      router.push('/admin/users');
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (error) {
    return (
      <>
        <PageHeader
          title="User Not Found"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Users', href: '/admin/users' },
            { label: 'Not Found' },
          ]}
        />
        <PageContent>
          <PageSection>
            <Card>
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Text type="secondary">
                  The user you are looking for could not be found.
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => router.push('/admin/users')}
                  >
                    Back to Users
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
        title={isLoading ? 'Loading...' : user?.name || 'User Details'}
        description={isLoading ? '' : user?.email}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: isLoading ? '...' : user?.name || 'Details' },
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
                    disabled={!isDirty}
                    loading={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending
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
            <PageSection>
              <Card>
                <Title level={5} style={{ marginBottom: 24 }}>
                  User Information
                </Title>
                {isLoading ? (
                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size={16}
                  >
                    <Skeleton.Input active style={{ width: '100%' }} />
                    <Skeleton.Input active style={{ width: '100%' }} />
                    <Skeleton.Input active style={{ width: '100%' }} />
                  </Space>
                ) : (
                  <Form layout="vertical">
                    <Form.Item
                      label="Name"
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
                            placeholder="Enter user name"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      validateStatus={errors.email ? 'error' : undefined}
                      help={
                        errors.email?.message ||
                        (user?.isEmailVerified
                          ? 'Email is verified'
                          : 'Email is not verified')
                      }
                    >
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="email"
                            disabled={!isEditing || user?.isEmailVerified}
                            placeholder="Enter email address"
                          />
                        )}
                      />
                    </Form.Item>

                    <Form.Item label="Status">
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={!isEditing}
                          >
                            Active
                          </Checkbox>
                        )}
                      />
                    </Form.Item>

                    <Form.Item label="Roles">
                      <Controller
                        name="roleIds"
                        control={control}
                        render={({ field }) => (
                          <Checkbox.Group
                            value={field.value}
                            onChange={(values) => field.onChange(values)}
                            disabled={!isEditing}
                          >
                            <Space wrap>
                              {(
                                rolesData?.data as
                                  | { id: number; name: string }[]
                                  | undefined
                              )?.map((role) => (
                                <Checkbox key={role.id} value={String(role.id)}>
                                  {role.name}
                                </Checkbox>
                              ))}
                            </Space>
                          </Checkbox.Group>
                        )}
                      />
                    </Form.Item>
                  </Form>
                )}
              </Card>
            </PageSection>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              <PageSection>
                <Card>
                  <Title level={5} style={{ marginBottom: 16 }}>
                    Account Status
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
                        <Text type="secondary">Status</Text>
                        <Badge
                          variant={user?.isActive ? 'success' : 'secondary'}
                        >
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text type="secondary">Email</Text>
                        <Badge
                          variant={
                            user?.isEmailVerified ? 'success' : 'warning'
                          }
                        >
                          {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text type="secondary">2FA</Text>
                        <Badge
                          variant={
                            user?.isTwoFactorEnabled ? 'success' : 'secondary'
                          }
                        >
                          {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
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
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
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
                          {user?.updatedAt
                            ? new Date(user.updatedAt).toLocaleDateString()
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
                    Current Roles
                  </Title>
                  {isLoading ? (
                    <Skeleton.Input active style={{ width: '100%' }} />
                  ) : (
                    <Space wrap>
                      {(user?.roles?.length ?? 0) > 0 ? (
                        user?.roles?.map(
                          (role: {
                            id: number;
                            name: string;
                            code: string;
                          }) => (
                            <Badge key={role.id} variant="secondary">
                              {role.name}
                            </Badge>
                          ),
                        )
                      ) : (
                        <Text type="secondary">No roles assigned</Text>
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
        title="Delete User"
        description={`Are you sure you want to delete ${user?.name}? This action cannot be undone.`}
        confirmText={deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteUserMutation.isPending}
      />
    </>
  );
}
