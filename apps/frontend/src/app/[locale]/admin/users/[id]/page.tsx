'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  Input,
  Modal,
  Skeleton,
} from '@/components/ui';
import { useUser, useUpdateUser, useDeleteUser, useRoles } from '@/hooks/api';
import { updateUserSchema, type UpdateUserInput } from '@/lib/validations';

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
    register,
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
        roleIds: user.roles?.map((r) => r.id) || [],
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
              <CardBody>
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    The user you are looking for could not be found.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => router.push('/admin/users')}
                  >
                    Back to Users
                  </Button>
                </div>
              </CardBody>
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
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isDirty || updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </>
              )}
            </div>
          )
        }
      />
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <PageSection>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    User Information
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        label="Name"
                        error={errors.name?.message}
                        required
                      >
                        {(props) => (
                          <Input
                            {...props}
                            {...register('name')}
                            disabled={!isEditing}
                            placeholder="Enter user name"
                          />
                        )}
                      </FormField>

                      <FormField
                        label="Email"
                        error={errors.email?.message}
                        hint={
                          user?.isEmailVerified
                            ? 'Email is verified'
                            : 'Email is not verified'
                        }
                      >
                        {(props) => (
                          <Input
                            {...props}
                            {...register('email')}
                            type="email"
                            disabled={!isEditing || user?.isEmailVerified}
                            placeholder="Enter email address"
                          />
                        )}
                      </FormField>

                      <FormField label="Status">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              {...register('isActive')}
                              disabled={!isEditing}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Active
                            </span>
                          </label>
                        </div>
                      </FormField>

                      <FormField label="Roles">
                        <div className="flex flex-wrap gap-2">
                          {rolesData?.data?.map((role) => (
                            <label
                              key={role.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                value={role.id}
                                {...register('roleIds')}
                                disabled={!isEditing}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {role.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </FormField>
                    </form>
                  )}
                </CardBody>
              </Card>
            </PageSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PageSection>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Account Status
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <Badge variant={user?.isActive ? 'success' : 'neutral'}>
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Email
                        </span>
                        <Badge
                          variant={
                            user?.isEmailVerified ? 'success' : 'warning'
                          }
                        >
                          {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          2FA
                        </span>
                        <Badge
                          variant={
                            user?.isTwoFactorEnabled ? 'success' : 'neutral'
                          }
                        >
                          {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Created
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Updated
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {user?.updatedAt
                              ? new Date(user.updatedAt).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </PageSection>

            <PageSection>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Current Roles
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <Skeleton className="h-6 w-full" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(user?.roles?.length ?? 0) > 0 ? (
                        user?.roles?.map((role) => (
                          <Badge key={role.id} variant="neutral">
                            {role.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No roles assigned
                        </span>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            </PageSection>
          </div>
        </div>
      </PageContent>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        size="sm"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.name}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
