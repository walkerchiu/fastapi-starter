'use client';

import { useState, useMemo } from 'react';
import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Skeleton,
} from '@/components/ui';
import { usePermissions, useRoles } from '@/hooks/api';
import type { Permission, Role } from '@/hooks/api/types';

// Extended permission type with optional module field
type PermissionWithModule = Permission & { module?: string };

export default function PermissionsPage() {
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  const { data: permissionsData, isLoading: permissionsLoading } =
    usePermissions({
      limit: 100,
    });
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ limit: 100 });

  const isLoading = permissionsLoading || rolesLoading;

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const grouped: Record<string, PermissionWithModule[]> = {};
    if (permissionsData?.data) {
      (permissionsData.data as PermissionWithModule[])
        .filter((permission) => {
          if (!search) return true;
          return (
            permission.name.toLowerCase().includes(search.toLowerCase()) ||
            permission.code.toLowerCase().includes(search.toLowerCase()) ||
            permission.module?.toLowerCase().includes(search.toLowerCase())
          );
        })
        .forEach((permission) => {
          const module = permission.module || 'General';
          if (!grouped[module]) {
            grouped[module] = [];
          }
          grouped[module].push(permission);
        });
    }
    return grouped;
  }, [permissionsData, search]);

  const roles = useMemo(() => {
    return rolesData?.data || [];
  }, [rolesData]);

  // Check if a role has a specific permission
  const hasPermission = (role: Role, permissionId: number) => {
    return role.permissions?.some((p) => p.id === permissionId) || false;
  };

  const toggleModule = (module: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(module)) {
        newSet.delete(module);
      } else {
        newSet.add(module);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedModules(new Set(Object.keys(permissionsByModule)));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  return (
    <>
      <PageHeader
        title="Permissions"
        description="View permission assignments across roles"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'User Management', href: '/admin/users' },
          { label: 'Permissions' },
        ]}
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Permission Matrix
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Overview of which permissions are assigned to each role.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="search"
                    placeholder="Search permissions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="ghost" size="sm" onClick={expandAll}>
                    Expand All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={collapseAll}>
                    Collapse All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Role headers */}
                  <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <div className="w-80 flex-shrink-0 border-r border-gray-200 px-4 py-3 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Permission
                      </span>
                    </div>
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="w-32 flex-shrink-0 border-r border-gray-200 px-4 py-3 text-center last:border-r-0 dark:border-gray-700"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {role.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Permission rows by module */}
                  {Object.entries(permissionsByModule).length > 0 ? (
                    Object.entries(permissionsByModule).map(
                      ([module, permissions]) => {
                        const isExpanded = expandedModules.has(module);
                        const totalPermissions = permissions.length;
                        const roleAssignments = roles.map((role) => ({
                          role,
                          count: permissions.filter((p) =>
                            hasPermission(role, p.id),
                          ).length,
                        }));

                        return (
                          <div key={module}>
                            {/* Module header */}
                            <button
                              onClick={() => toggleModule(module)}
                              className="flex w-full items-center border-b border-gray-200 bg-gray-100 px-4 py-2 text-left hover:bg-gray-150 dark:border-gray-700 dark:bg-gray-750 dark:hover:bg-gray-700"
                            >
                              <div className="flex w-80 flex-shrink-0 items-center gap-2">
                                <svg
                                  className={`h-4 w-4 transform transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {module}
                                </span>
                                <Badge variant="neutral">
                                  {totalPermissions}
                                </Badge>
                              </div>
                              {roles.map((role) => {
                                const assignment = roleAssignments.find(
                                  (a) => a.role.id === role.id,
                                );
                                return (
                                  <div
                                    key={role.id}
                                    className="w-32 flex-shrink-0 text-center"
                                  >
                                    <Badge
                                      variant={
                                        assignment?.count === totalPermissions
                                          ? 'success'
                                          : assignment?.count === 0
                                            ? 'neutral'
                                            : 'warning'
                                      }
                                    >
                                      {assignment?.count}/{totalPermissions}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </button>

                            {/* Permission rows */}
                            {isExpanded &&
                              permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                  <div className="w-80 flex-shrink-0 border-r border-gray-200 px-4 py-3 dark:border-gray-700">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {permission.name}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {permission.code}
                                      </span>
                                      {permission.description && (
                                        <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                          {permission.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {roles.map((role) => (
                                    <div
                                      key={role.id}
                                      className="flex w-32 flex-shrink-0 items-center justify-center border-r border-gray-200 px-4 py-3 last:border-r-0 dark:border-gray-700"
                                    >
                                      {hasPermission(role, permission.id) ? (
                                        <svg
                                          className="h-5 w-5 text-green-500"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          className="h-5 w-5 text-gray-300 dark:text-gray-600"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                          </div>
                        );
                      },
                    )
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No permissions found matching your search.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </PageSection>

        {/* Legend */}
        <PageSection>
          <Card>
            <CardBody>
              <div className="flex flex-wrap items-center gap-6">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Legend:
                </span>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Permission granted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-gray-300 dark:text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Permission denied
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">All</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    All permissions in module
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Partial</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Some permissions
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
