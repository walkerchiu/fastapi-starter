'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/components/ui';
import {
  useCreateRole,
  usePermissions,
  useReplaceRolePermissions,
} from '@/hooks/api';
import type { Permission } from '@/hooks/api/types';
import { createRoleSchema, type CreateRoleInput } from '@/lib/validations';

// Extended permission type with optional module field
type PermissionWithModule = Permission & { module?: string };

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
    register,
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

  const onSubmit = async (data: CreateRoleInput) => {
    try {
      // First create the role
      const createdRole = await createRoleMutation.mutateAsync({
        code: data.code,
        name: data.name,
        description: data.description,
      });

      // Then set permissions if any are selected
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
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
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
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter the details for the new role.
                  </p>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      label="Role Name"
                      error={errors.name?.message}
                      required
                    >
                      {(props) => (
                        <Input
                          {...props}
                          {...register('name')}
                          placeholder="Enter role name"
                        />
                      )}
                    </FormField>

                    <FormField
                      label="Role Code"
                      error={errors.code?.message}
                      hint="Unique identifier (lowercase letters, numbers, and underscores only)"
                      required
                    >
                      {(props) => (
                        <Input
                          {...props}
                          {...register('code')}
                          placeholder="e.g., content_editor"
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
                          placeholder="Enter role description"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
                        />
                      )}
                    </FormField>

                    {createRoleMutation.isError && (
                      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Failed to create role. Please try again.
                        </p>
                      </div>
                    )}
                  </form>
                </CardBody>
              </Card>
            </PageSection>

            {/* Permission Matrix */}
            <PageSection>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Permissions
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Select the permissions for this role.
                      </p>
                    </div>
                    <Badge variant="info">
                      {selectedPermissions.size} selected
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  {permissionsLoading ? (
                    <div className="space-y-4">
                      <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                      <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
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
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    allSelected
                                      ? handleDeselectAllInModule(permissions)
                                      : handleSelectAllInModule(permissions)
                                  }
                                >
                                  {allSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                              </div>
                              <div className="grid gap-2 p-4 sm:grid-cols-2">
                                {permissions.map((permission) => (
                                  <label
                                    key={permission.id}
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
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
                                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
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
                    Summary
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Selected permissions
                      </span>
                      <Badge variant="info">{selectedPermissions.size}</Badge>
                    </div>
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        Selected Permissions:
                      </h4>
                      {selectedPermissions.size > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {permissionsData?.data
                            ?.filter((p) => selectedPermissions.has(p.id))
                            .map((p) => (
                              <Badge key={p.id} variant="neutral" size="sm">
                                {p.name}
                              </Badge>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No permissions selected
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </PageSection>
          </div>
        </div>
      </PageContent>
    </>
  );
}
