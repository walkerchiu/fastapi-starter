'use client';

import { useEffect, useState, useMemo } from 'react';
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
import {
  useRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
  useReplaceRolePermissions,
} from '@/hooks/api';
import type { Permission } from '@/hooks/api/types';
import { updateRoleSchema, type UpdateRoleInput } from '@/lib/validations';

// Extended permission type with optional module field
type PermissionWithModule = Permission & { module?: string };

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
    register,
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
      setSelectedPermissions(new Set(role.permissions?.map((p) => p.id) || []));
    }
  }, [role, reset]);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, PermissionWithModule[]> = {};
    if (permissionsData?.data) {
      (permissionsData.data as PermissionWithModule[]).forEach((permission) => {
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
    setSelectedPermissions(new Set(role?.permissions?.map((p) => p.id) || []));
    setIsEditing(false);
  };

  const hasPermissionChanges = useMemo(() => {
    if (!role?.permissions) return false;
    const originalIds = new Set(role.permissions.map((p) => p.id));
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
              <CardBody>
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    The role you are looking for could not be found.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => router.push('/admin/roles')}
                  >
                    Back to Roles
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
        title={isLoading ? 'Loading...' : role?.name || 'Role Details'}
        description={isLoading ? '' : role?.code}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Roles', href: '/admin/roles' },
          { label: isLoading ? '...' : role?.name || 'Details' },
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
                    disabled={
                      (!isDirty && !hasPermissionChanges) ||
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
                    Role Information
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        label="Role Name"
                        error={errors.name?.message}
                        required
                      >
                        {(props) => (
                          <Input
                            {...props}
                            {...register('name')}
                            disabled={!isEditing}
                            placeholder="Enter role name"
                          />
                        )}
                      </FormField>

                      <FormField label="Role Code">
                        {() => (
                          <Input
                            value={role?.code || ''}
                            disabled
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        )}
                      </FormField>

                      <FormField
                        label="Description"
                        error={errors.description?.message}
                      >
                        {(props) => (
                          <textarea
                            {...props}
                            {...register('description')}
                            disabled={!isEditing}
                            placeholder="Enter role description"
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-800 sm:text-sm"
                          />
                        )}
                      </FormField>
                    </form>
                  )}
                </CardBody>
              </Card>
            </PageSection>

            {/* Permission Matrix */}
            <PageSection>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Permissions
                    </h3>
                    <Badge variant="info">
                      {selectedPermissions.size} selected
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(permissionsByModule).map(
                        ([module, permissions]) => {
                          const allSelected = permissions.every((p) =>
                            selectedPermissions.has(p.id),
                          );

                          return (
                            <div
                              key={module}
                              className="rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {module}
                                </h4>
                                {isEditing && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
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
                                )}
                              </div>
                              <div className="grid gap-2 p-4 sm:grid-cols-2">
                                {permissions.map((permission) => (
                                  <label
                                    key={permission.id}
                                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                                      isEditing
                                        ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                                        : ''
                                    } ${
                                      selectedPermissions.has(permission.id)
                                        ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPermissions.has(
                                        permission.id,
                                      )}
                                      onChange={() =>
                                        handlePermissionToggle(permission.id)
                                      }
                                      disabled={!isEditing}
                                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700"
                                    />
                                    <div className="flex-1">
                                      <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {permission.name}
                                      </span>
                                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                                        {permission.code}
                                      </span>
                                      {permission.description && (
                                        <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">
                                          {permission.description}
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        },
                      )}

                      {Object.keys(permissionsByModule).length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No permissions available
                        </p>
                      )}
                    </div>
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
                    Role Statistics
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Users with this role
                        </span>
                        <Badge variant="neutral">-</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Assigned permissions
                        </span>
                        <Badge variant="info">
                          {role?.permissions?.length || 0}
                        </Badge>
                      </div>
                      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Created
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {role?.createdAt
                              ? new Date(role.createdAt).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Updated
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {role?.updatedAt
                              ? new Date(role.updatedAt).toLocaleDateString()
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
                    Current Permissions
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <Skeleton className="h-6 w-full" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(role?.permissions?.length ?? 0) > 0 ? (
                        role?.permissions?.map((permission) => (
                          <Badge key={permission.id} variant="neutral">
                            {permission.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No permissions assigned
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
        title="Delete Role"
        size="sm"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {role?.name}
            </span>
            ? This action cannot be undone and will remove this role from all
            users.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteRoleMutation.isPending}
          >
            {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
