'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import {
  PageHeader,
  PageContent,
  PageSection,
  FormSection,
} from '@/components/dashboard';
import { FormField } from '@/components/ui';
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
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </Stack>
        }
      />
      <PageContent>
        <Grid container spacing={3}>
          {/* Main content */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <PageSection>
                <FormSection
                  title="Role Information"
                  description="Enter the details for the new role."
                >
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
                            placeholder="Enter role name"
                            error={!!errors.name}
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
                          <TextField
                            {...props}
                            {...register('code')}
                            fullWidth
                            placeholder="e.g., content_editor"
                            error={!!errors.code}
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
                            placeholder="Enter role description"
                            error={!!errors.description}
                          />
                        )}
                      </FormField>

                      {createRoleMutation.isError && (
                        <Alert severity="error">
                          Failed to create role. Please try again.
                        </Alert>
                      )}
                    </Stack>
                  </form>
                </FormSection>
              </PageSection>

              {/* Permission Matrix */}
              <PageSection>
                <FormSection
                  title="Permissions"
                  description="Select the permissions for this role."
                  action={
                    <Chip
                      label={`${selectedPermissions.size} selected`}
                      color="info"
                      size="small"
                    />
                  }
                >
                  {permissionsLoading ? (
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
                                <Button
                                  size="small"
                                  onClick={() =>
                                    allSelected
                                      ? handleDeselectAllInModule(permissions)
                                      : handleSelectAllInModule(permissions)
                                  }
                                >
                                  {allSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                              </Box>
                              <Grid container spacing={1} sx={{ p: 2 }}>
                                {permissions.map((permission) => (
                                  <Grid item xs={12} sm={6} key={permission.id}>
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 1.5,
                                        cursor: 'pointer',
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
                                        '&:hover': {
                                          bgcolor: selectedPermissions.has(
                                            permission.id,
                                          )
                                            ? 'primary.lighter'
                                            : 'action.hover',
                                        },
                                      }}
                                      onClick={() =>
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
            <PageSection>
              <FormSection title="Summary">
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Selected permissions
                    </Typography>
                    <Chip
                      label={selectedPermissions.size}
                      color="info"
                      size="small"
                    />
                  </Box>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                      Selected Permissions:
                    </Typography>
                    {selectedPermissions.size > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {permissionsData?.data
                          ?.filter((p: Permission) =>
                            selectedPermissions.has(p.id),
                          )
                          .map((p: Permission) => (
                            <Chip key={p.id} label={p.name} size="small" />
                          ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No permissions selected
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </FormSection>
            </PageSection>
          </Grid>
        </Grid>
      </PageContent>
    </>
  );
}
