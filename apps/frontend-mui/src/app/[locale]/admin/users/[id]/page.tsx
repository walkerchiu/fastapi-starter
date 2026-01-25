'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Checkbox,
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
    control,
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
        roleIds: user.roles?.map((r: { id: number }) => r.id) || [],
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
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                The user you are looking for could not be found.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/admin/users')}
              >
                Back to Users
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
        title={isLoading ? 'Loading...' : user?.name || 'User Details'}
        description={isLoading ? '' : user?.email}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: isLoading ? '...' : user?.name || 'Details' },
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
            <PageSection>
              <FormSection
                title="User Information"
                description="Basic user account details"
              >
                {isLoading ? (
                  <Stack spacing={3}>
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                  </Stack>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                      <FormField
                        label="Name"
                        error={errors.name?.message}
                        required
                      >
                        {(props) => (
                          <TextField
                            {...props}
                            {...register('name')}
                            fullWidth
                            disabled={!isEditing}
                            placeholder="Enter user name"
                            error={!!errors.name}
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
                          <TextField
                            {...props}
                            {...register('email')}
                            type="email"
                            fullWidth
                            disabled={!isEditing || user?.isEmailVerified}
                            placeholder="Enter email address"
                            error={!!errors.email}
                          />
                        )}
                      </FormField>

                      <FormField label="Status">
                        <Controller
                          name="isActive"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value || false}
                                  onChange={field.onChange}
                                  disabled={!isEditing}
                                />
                              }
                              label="Active"
                            />
                          )}
                        />
                      </FormField>

                      <FormField label="Roles">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {rolesData?.data?.map(
                            (role: { id: number; name: string }) => (
                              <Controller
                                key={role.id}
                                name="roleIds"
                                control={control}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          field.value?.includes(role.id) ||
                                          false
                                        }
                                        onChange={(e) => {
                                          const newValue = e.target.checked
                                            ? [...(field.value || []), role.id]
                                            : (field.value || []).filter(
                                                (id: number) => id !== role.id,
                                              );
                                          field.onChange(newValue);
                                        }}
                                        disabled={!isEditing}
                                      />
                                    }
                                    label={role.name}
                                  />
                                )}
                              />
                            ),
                          )}
                        </Box>
                      </FormField>
                    </Stack>
                  </form>
                )}
              </FormSection>
            </PageSection>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <PageSection>
                <FormSection title="Account Status">
                  {isLoading ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rounded" height={24} width={80} />
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
                          Status
                        </Typography>
                        <Chip
                          label={user?.isActive ? 'Active' : 'Inactive'}
                          color={user?.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Chip
                          label={
                            user?.isEmailVerified ? 'Verified' : 'Unverified'
                          }
                          color={user?.isEmailVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          2FA
                        </Typography>
                        <Chip
                          label={
                            user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'
                          }
                          color={
                            user?.isTwoFactorEnabled ? 'success' : 'default'
                          }
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
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
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
                          {user?.updatedAt
                            ? new Date(user.updatedAt).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </FormSection>
              </PageSection>

              <PageSection>
                <FormSection title="Current Roles">
                  {isLoading ? (
                    <Skeleton variant="rounded" height={32} />
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(user?.roles?.length ?? 0) > 0 ? (
                        user?.roles?.map(
                          (role: {
                            id: number;
                            name: string;
                            code: string;
                          }) => (
                            <Chip
                              key={role.id}
                              label={role.name}
                              size="small"
                            />
                          ),
                        )
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No roles assigned
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
        title="Delete User"
        description={`Are you sure you want to delete ${user?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteUserMutation.isPending}
      />
    </>
  );
}
