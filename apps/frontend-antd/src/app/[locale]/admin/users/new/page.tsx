'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Space,
  Typography,
} from 'antd';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { useCreateUser, useRoles } from '@/hooks/api';
import { createUserSchema, type CreateUserInput } from '@/lib/validations';

const { Text, Title } = Typography;

export default function NewUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ limit: 100 });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      isActive: true,
      roleIds: [],
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    try {
      await createUserMutation.mutateAsync(data);
      router.push('/admin/users');
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <>
      <PageHeader
        title="Create User"
        description="Add a new user to the system"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Create User' },
        ]}
        actions={
          <Space>
            <Button onClick={() => router.back()}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting || createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </Space>
        }
      />
      <PageContent>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <PageSection>
            <Card>
              <Title level={5} style={{ marginBottom: 8 }}>
                User Information
              </Title>
              <Text
                type="secondary"
                style={{ display: 'block', marginBottom: 24 }}
              >
                Enter the details for the new user account.
              </Text>

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
                        placeholder="Enter user name"
                        autoComplete="name"
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  required
                  validateStatus={errors.email ? 'error' : undefined}
                  help={errors.email?.message}
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                        autoComplete="email"
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  required
                  validateStatus={errors.password ? 'error' : undefined}
                  help={
                    errors.password?.message ||
                    'Must be at least 8 characters with uppercase, lowercase, and number'
                  }
                >
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        placeholder="Enter password"
                        autoComplete="new-password"
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label="Roles"
                  required
                  validateStatus={errors.roleIds ? 'error' : undefined}
                  help={errors.roleIds?.message}
                >
                  {rolesLoading ? (
                    <Text type="secondary">Loading roles...</Text>
                  ) : (rolesData?.data?.length ?? 0) > 0 ? (
                    <Controller
                      name="roleIds"
                      control={control}
                      render={({ field }) => (
                        <div>
                          {(
                            rolesData?.data as
                              | {
                                  id: number;
                                  name: string;
                                  description?: string;
                                }[]
                              | undefined
                          )?.map((role) => (
                            <Card
                              key={role.id}
                              size="small"
                              style={{
                                marginBottom: 8,
                                cursor: 'pointer',
                                borderColor: field.value?.includes(
                                  String(role.id),
                                )
                                  ? '#1890ff'
                                  : undefined,
                              }}
                              onClick={() => {
                                const roleIdStr = String(role.id);
                                const newValue = field.value?.includes(
                                  roleIdStr,
                                )
                                  ? field.value.filter(
                                      (id: string) => id !== roleIdStr,
                                    )
                                  : [...(field.value || []), roleIdStr];
                                field.onChange(newValue);
                              }}
                            >
                              <Space>
                                <Checkbox
                                  checked={field.value?.includes(
                                    String(role.id),
                                  )}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const roleIdStr = String(role.id);
                                    const newValue = e.target.checked
                                      ? [...(field.value || []), roleIdStr]
                                      : field.value?.filter(
                                          (id: string) => id !== roleIdStr,
                                        );
                                    field.onChange(newValue);
                                  }}
                                />
                                <div>
                                  <Text strong>{role.name}</Text>
                                  {role.description && (
                                    <Text
                                      type="secondary"
                                      style={{
                                        display: 'block',
                                        fontSize: 12,
                                      }}
                                    >
                                      {role.description}
                                    </Text>
                                  )}
                                </div>
                              </Space>
                            </Card>
                          ))}
                        </div>
                      )}
                    />
                  ) : (
                    <Text type="secondary">No roles available</Text>
                  )}
                </Form.Item>

                <Form.Item label="Status">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Card size="small">
                        <Space>
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          <div>
                            <Text strong>Active</Text>
                            <Text
                              type="secondary"
                              style={{ display: 'block', fontSize: 12 }}
                            >
                              User can log in and access the system
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    )}
                  />
                </Form.Item>

                {createUserMutation.isError && (
                  <Alert
                    type="error"
                    message="Failed to create user. Please try again."
                    style={{ marginTop: 16 }}
                  />
                )}
              </Form>
            </Card>
          </PageSection>
        </div>
      </PageContent>
    </>
  );
}
