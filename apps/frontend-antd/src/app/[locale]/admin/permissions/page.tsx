'use client';

import { useState, useMemo } from 'react';
import { Button, Card, Input, Space, Tag, Typography, Skeleton } from 'antd';
import {
  RightOutlined,
  SearchOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExpandAltOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { usePermissions, useRoles } from '@/hooks/api';

const { Text, Title } = Typography;

interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  module?: string;
}

interface Role {
  id: number;
  name: string;
  code: string;
  permissions?: Array<{ id: number }>;
}

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
    const grouped: Record<string, Permission[]> = {};
    if (permissionsData?.data) {
      (permissionsData.data as Permission[])
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
    return (rolesData?.data || []) as Role[];
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
          <Card
            title={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    Permission Matrix
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Overview of which permissions are assigned to each role.
                  </Text>
                </div>
                <Space wrap>
                  <Input
                    placeholder="Search permissions..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 240 }}
                    allowClear
                  />
                  <Button icon={<ExpandAltOutlined />} onClick={expandAll}>
                    Expand All
                  </Button>
                  <Button icon={<ShrinkOutlined />} onClick={collapseAll}>
                    Collapse All
                  </Button>
                </Space>
              </div>
            }
            styles={{ body: { padding: 0 } }}
          >
            {isLoading ? (
              <div style={{ padding: 24 }}>
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Skeleton active paragraph={{ rows: 1 }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Space>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                {/* Role headers */}
                <div
                  style={{
                    display: 'flex',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: '#fafafa',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      width: 320,
                      flexShrink: 0,
                      padding: '12px 16px',
                      borderRight: '1px solid #f0f0f0',
                    }}
                  >
                    <Text strong>Permission</Text>
                  </div>
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      style={{
                        width: 128,
                        flexShrink: 0,
                        padding: '12px 16px',
                        textAlign: 'center',
                        borderRight: '1px solid #f0f0f0',
                      }}
                    >
                      <Text strong>{role.name}</Text>
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
                          <div
                            onClick={() => toggleModule(module)}
                            style={{
                              display: 'flex',
                              cursor: 'pointer',
                              background: '#f5f5f5',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                          >
                            <div
                              style={{
                                width: 320,
                                flexShrink: 0,
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <RightOutlined
                                style={{
                                  fontSize: 12,
                                  transform: isExpanded
                                    ? 'rotate(90deg)'
                                    : 'none',
                                  transition: 'transform 0.2s',
                                }}
                              />
                              <Text strong>{module}</Text>
                              <Tag>{totalPermissions}</Tag>
                            </div>
                            {roles.map((role) => {
                              const assignment = roleAssignments.find(
                                (a) => a.role.id === role.id,
                              );
                              return (
                                <div
                                  key={role.id}
                                  style={{
                                    width: 128,
                                    flexShrink: 0,
                                    padding: '8px 16px',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Tag
                                    color={
                                      assignment?.count === totalPermissions
                                        ? 'success'
                                        : assignment?.count === 0
                                          ? 'default'
                                          : 'warning'
                                    }
                                  >
                                    {assignment?.count}/{totalPermissions}
                                  </Tag>
                                </div>
                              );
                            })}
                          </div>

                          {/* Permission rows */}
                          {isExpanded &&
                            permissions.map((permission) => (
                              <div
                                key={permission.id}
                                style={{
                                  display: 'flex',
                                  borderBottom: '1px solid #f0f0f0',
                                }}
                              >
                                <div
                                  style={{
                                    width: 320,
                                    flexShrink: 0,
                                    padding: '12px 16px 12px 40px',
                                    borderRight: '1px solid #f0f0f0',
                                  }}
                                >
                                  <Text strong style={{ display: 'block' }}>
                                    {permission.name}
                                  </Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {permission.code}
                                  </Text>
                                  {permission.description && (
                                    <Text
                                      type="secondary"
                                      style={{
                                        fontSize: 12,
                                        display: 'block',
                                        marginTop: 4,
                                      }}
                                    >
                                      {permission.description}
                                    </Text>
                                  )}
                                </div>
                                {roles.map((role) => (
                                  <div
                                    key={role.id}
                                    style={{
                                      width: 128,
                                      flexShrink: 0,
                                      padding: '12px 16px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRight: '1px solid #f0f0f0',
                                    }}
                                  >
                                    {hasPermission(role, permission.id) ? (
                                      <CheckCircleFilled
                                        style={{
                                          color: '#52c41a',
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : (
                                      <CloseCircleFilled
                                        style={{
                                          color: '#d9d9d9',
                                          fontSize: 20,
                                        }}
                                      />
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
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <Text type="secondary">
                      No permissions found matching your search.
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </PageSection>

        {/* Legend */}
        <PageSection>
          <Card>
            <Space size="large" wrap>
              <Text strong>Legend:</Text>
              <Space>
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                <Text type="secondary">Permission granted</Text>
              </Space>
              <Space>
                <CloseCircleFilled style={{ color: '#d9d9d9', fontSize: 20 }} />
                <Text type="secondary">Permission denied</Text>
              </Space>
              <Space>
                <Tag color="success">All</Tag>
                <Text type="secondary">All permissions in module</Text>
              </Space>
              <Space>
                <Tag color="warning">Partial</Tag>
                <Text type="secondary">Some permissions</Text>
              </Space>
            </Space>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
