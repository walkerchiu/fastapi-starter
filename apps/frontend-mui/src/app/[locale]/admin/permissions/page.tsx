'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
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
          <Paper sx={{ overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h6">Permission Matrix</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overview of which permissions are assigned to each role.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    placeholder="Search permissions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    sx={{ width: 250 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    size="small"
                    startIcon={<UnfoldMoreIcon />}
                    onClick={expandAll}
                  >
                    Expand All
                  </Button>
                  <Button
                    size="small"
                    startIcon={<UnfoldLessIcon />}
                    onClick={collapseAll}
                  >
                    Collapse All
                  </Button>
                </Stack>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 0 }}>
              {isLoading ? (
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Skeleton variant="rounded" height={48} />
                    <Skeleton variant="rounded" height={96} />
                    <Skeleton variant="rounded" height={96} />
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  {/* Role headers */}
                  <Box
                    sx={{
                      display: 'flex',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      bgcolor: 'grey.100',
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        width: 320,
                        flexShrink: 0,
                        px: 2,
                        py: 1.5,
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Permission
                      </Typography>
                    </Box>
                    {roles.map((role) => (
                      <Box
                        key={role.id}
                        sx={{
                          width: 128,
                          flexShrink: 0,
                          px: 2,
                          py: 1.5,
                          textAlign: 'center',
                          borderRight: 1,
                          borderColor: 'divider',
                          '&:last-child': { borderRight: 0 },
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          {role.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

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
                          <Box key={module}>
                            {/* Module header */}
                            <Box
                              onClick={() => toggleModule(module)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                bgcolor: 'grey.50',
                                borderBottom: 1,
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'grey.100' },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 320,
                                  flexShrink: 0,
                                  px: 2,
                                  py: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                {isExpanded ? (
                                  <ExpandMoreIcon fontSize="small" />
                                ) : (
                                  <ChevronRightIcon fontSize="small" />
                                )}
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={600}
                                >
                                  {module}
                                </Typography>
                                <Chip label={totalPermissions} size="small" />
                              </Box>
                              {roles.map((role) => {
                                const assignment = roleAssignments.find(
                                  (a) => a.role.id === role.id,
                                );
                                return (
                                  <Box
                                    key={role.id}
                                    sx={{
                                      width: 128,
                                      flexShrink: 0,
                                      textAlign: 'center',
                                      py: 1,
                                    }}
                                  >
                                    <Chip
                                      label={`${assignment?.count}/${totalPermissions}`}
                                      size="small"
                                      color={
                                        assignment?.count === totalPermissions
                                          ? 'success'
                                          : assignment?.count === 0
                                            ? 'default'
                                            : 'warning'
                                      }
                                    />
                                  </Box>
                                );
                              })}
                            </Box>

                            {/* Permission rows */}
                            <Collapse in={isExpanded}>
                              {permissions.map((permission) => (
                                <Box
                                  key={permission.id}
                                  sx={{
                                    display: 'flex',
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 320,
                                      flexShrink: 0,
                                      px: 2,
                                      py: 1.5,
                                      borderRight: 1,
                                      borderColor: 'divider',
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {permission.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {permission.code}
                                    </Typography>
                                    {permission.description && (
                                      <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        display="block"
                                        sx={{ mt: 0.5 }}
                                      >
                                        {permission.description}
                                      </Typography>
                                    )}
                                  </Box>
                                  {roles.map((role) => (
                                    <Box
                                      key={role.id}
                                      sx={{
                                        width: 128,
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRight: 1,
                                        borderColor: 'divider',
                                        '&:last-child': { borderRight: 0 },
                                      }}
                                    >
                                      {hasPermission(role, permission.id) ? (
                                        <CheckIcon color="success" />
                                      ) : (
                                        <CloseIcon color="disabled" />
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              ))}
                            </Collapse>
                          </Box>
                        );
                      },
                    )
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No permissions found matching your search.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </PageSection>

        {/* Legend */}
        <PageSection>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction="row"
              spacing={4}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
              >
                Legend:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon color="success" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Permission granted
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CloseIcon color="disabled" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Permission denied
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="All" size="small" color="success" />
                <Typography variant="body2" color="text.secondary">
                  All permissions in module
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Partial" size="small" color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Some permissions
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </PageSection>
      </PageContent>
    </>
  );
}
