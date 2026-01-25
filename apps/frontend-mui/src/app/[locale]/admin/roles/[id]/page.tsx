'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import {
  PageHeader,
  PageContent,
  PageSection,
  ConfirmDialog,
  FormSection,
} from '@/components/dashboard';
import { FormField } from '@/components/ui';
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

  const handleSelectAllInModule = (permissions: PermissionWithModule[]) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => newSet.add(p.id));
      return newSet;
    });
  };

  const handleDeselectAllInModule = (permissions: PermissionWithModule[]) => {
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
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                The role you are looking for could not be found.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/admin/roles')}
              >
                Back to Roles
              </Button>
            </Paper>
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
            <Stack direction="row" spacing={1}>
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
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
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </>
              )}
            </Stack>
          )
        }
      />
      <PageContent>
        <Grid container spacing={3}>
          {/* Main content */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <PageSection>
                <FormSection title="Role Information">
                  {isLoading ? (
                    <Stack spacing={3}>
                      <Skeleton variant="rounded" height={56} />
                      <Skeleton variant="rounded" height={56} />
                      <Skeleton variant="rounded" height={80} />
                    </Stack>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <Stack spacing={3}>
                        <FormField
                          label="Role Name"
                          error={errors.name?.message}
                          required
                        >
                          {(props) => (
                            <TextField
                              {...props}
                              {...register('name')}
                              fullWidth
                              disabled={!isEditing}
                              placeholder="Enter role name"
                              error={!!errors.name}
                            />
                          )}
                        </FormField>

                        <FormField label="Role Code">
                          {() => (
                            <TextField
                              value={role?.code || ''}
                              fullWidth
                              disabled
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  bgcolor: 'action.disabledBackground',
                                },
                              }}
                            />
                          )}
                        </FormField>

                        <FormField
                          label="Description"
                          error={errors.description?.message}
                        >
                          {(props) => (
                            <TextField
                              {...props}
                              {...register('description')}
                              fullWidth
                              multiline
                              rows={3}
                              disabled={!isEditing}
                              placeholder="Enter role description"
                              error={!!errors.description}
                            />
                          )}
                        </FormField>
                      </Stack>
                    </form>
                  )}
                </FormSection>
              </PageSection>

              {/* Permission Matrix */}
              <PageSection>
                <FormSection
                  title="Permissions"
                  action={
                    <Chip
                      label={`${selectedPermissions.size} selected`}
                      color="info"
                      size="small"
                    />
                  }
                >
                  {isLoading ? (
                    <Stack spacing={3}>
                      <Skeleton variant="rounded" height={100} />
                      <Skeleton variant="rounded" height={100} />
                    </Stack>
                  ) : (
                    <Stack spacing={3}>
                      {Object.entries(permissionsByModule).map(
                        ([module, permissions]) => {
                          const allSelected = permissions.every((p) =>
                            selectedPermissions.has(p.id),
                          );

                          return (
                            <Paper key={module} variant="outlined">
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  px: 2,
                                  py: 1.5,
                                  bgcolor: 'grey.50',
                                  borderBottom: 1,
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={600}
                                >
                                  {module}
                                </Typography>
                                {isEditing && (
                                  <Button
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
                                )}
                              </Box>
                              <Grid container spacing={1} sx={{ p: 2 }}>
                                {permissions.map((permission) => (
                                  <Grid item xs={12} sm={6} key={permission.id}>
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 1.5,
                                        cursor: isEditing
                                          ? 'pointer'
                                          : 'default',
                                        bgcolor: selectedPermissions.has(
                                          permission.id,
                                        )
                                          ? 'primary.lighter'
                                          : 'transparent',
                                        borderColor: selectedPermissions.has(
                                          permission.id,
                                        )
                                          ? 'primary.light'
                                          : 'divider',
                                        '&:hover': isEditing
                                          ? {
                                              bgcolor: selectedPermissions.has(
                                                permission.id,
                                              )
                                                ? 'primary.lighter'
                                                : 'action.hover',
                                            }
                                          : {},
                                      }}
                                      onClick={() =>
                                        isEditing &&
                                        handlePermissionToggle(permission.id)
                                      }
                                    >
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={selectedPermissions.has(
                                              permission.id,
                                            )}
                                            onChange={() =>
                                              handlePermissionToggle(
                                                permission.id,
                                              )
                                            }
                                            disabled={!isEditing}
                                            onClick={(e) => e.stopPropagation()}
                                            size="small"
                                          />
                                        }
                                        label={
                                          <Box>
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
                                        }
                                        sx={{ m: 0, width: '100%' }}
                                      />
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Paper>
                          );
                        },
                      )}

                      {Object.keys(permissionsByModule).length === 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 4, textAlign: 'center' }}
                        >
                          No permissions available
                        </Typography>
                      )}
                    </Stack>
                  )}
                </FormSection>
              </PageSection>
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <PageSection>
                <FormSection title="Role Statistics">
                  {isLoading ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rounded" height={24} width={80} />
                      <Skeleton variant="rounded" height={24} width={80} />
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Users with this role
                        </Typography>
                        <Chip label="-" size="small" />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Assigned permissions
                        </Typography>
                        <Chip
                          label={role?.permissions?.length || 0}
                          color="info"
                          size="small"
                        />
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body2">
                          {role?.createdAt
                            ? new Date(role.createdAt).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Updated
                        </Typography>
                        <Typography variant="body2">
                          {role?.updatedAt
                            ? new Date(role.updatedAt).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </FormSection>
              </PageSection>

              <PageSection>
                <FormSection title="Current Permissions">
                  {isLoading ? (
                    <Skeleton variant="rounded" height={32} />
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {role?.permissions?.length ? (
                        role.permissions.map((permission) => (
                          <Chip
                            key={permission.id}
                            label={permission.name}
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No permissions assigned
                        </Typography>
                      )}
                    </Box>
                  )}
                </FormSection>
              </PageSection>
            </Stack>
          </Grid>
        </Grid>
      </PageContent>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        description={`Are you sure you want to delete ${role?.name}? This action cannot be undone and will remove this role from all users.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteRoleMutation.isPending}
      />
    </>
  );
}
