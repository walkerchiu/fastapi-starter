'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
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
import { useCreateUser, useRoles } from '@/hooks/api';
import { createUserSchema, type CreateUserInput } from '@/lib/validations';

export default function NewUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ limit: 100 });

  const {
    control,
    register,
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
              disabled={isSubmitting || createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </Stack>
        }
      />
      <PageContent>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <PageSection>
            <FormSection
              title="User Information"
              description="Enter the details for the new user account."
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <FormField label="Name" error={errors.name?.message} required>
                    {(props) => (
                      <TextField
                        {...props}
                        {...register('name')}
                        fullWidth
                        placeholder="Enter user name"
                        autoComplete="name"
                        error={!!errors.name}
                      />
                    )}
                  </FormField>

                  <FormField
                    label="Email"
                    error={errors.email?.message}
                    required
                  >
                    {(props) => (
                      <TextField
                        {...props}
                        {...register('email')}
                        type="email"
                        fullWidth
                        placeholder="Enter email address"
                        autoComplete="email"
                        error={!!errors.email}
                      />
                    )}
                  </FormField>

                  <FormField
                    label="Password"
                    error={errors.password?.message}
                    hint="Must be at least 8 characters with uppercase, lowercase, and number"
                    required
                  >
                    {(props) => (
                      <TextField
                        {...props}
                        {...register('password')}
                        type="password"
                        fullWidth
                        placeholder="Enter password"
                        autoComplete="new-password"
                        error={!!errors.password}
                      />
                    )}
                  </FormField>

                  <FormField
                    label="Roles"
                    error={errors.roleIds?.message}
                    required
                  >
                    <Stack spacing={1}>
                      {rolesLoading ? (
                        <Typography variant="body2" color="text.secondary">
                          Loading roles...
                        </Typography>
                      ) : (rolesData?.data?.length ?? 0) > 0 ? (
                        rolesData?.data?.map(
                          (role: {
                            id: number;
                            name: string;
                            description?: string | null;
                          }) => (
                            <Controller
                              key={role.id}
                              name="roleIds"
                              control={control}
                              render={({ field }) => (
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                    },
                                  }}
                                  onClick={() => {
                                    const isChecked = field.value?.includes(
                                      role.id,
                                    );
                                    const newValue = isChecked
                                      ? (field.value || []).filter(
                                          (id: number) => id !== role.id,
                                        )
                                      : [...(field.value || []), role.id];
                                    field.onChange(newValue);
                                  }}
                                >
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
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          fontWeight={500}
                                        >
                                          {role.name}
                                        </Typography>
                                        {role.description && (
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {role.description}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                    sx={{ m: 0, width: '100%' }}
                                  />
                                </Paper>
                              )}
                            />
                          ),
                        )
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No roles available
                        </Typography>
                      )}
                    </Stack>
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
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Active
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                User can log in and access the system
                              </Typography>
                            </Box>
                          }
                        />
                      )}
                    />
                  </FormField>

                  {createUserMutation.isError && (
                    <Alert severity="error">
                      Failed to create user. Please try again.
                    </Alert>
                  )}
                </Stack>
              </form>
            </FormSection>
          </PageSection>
        </Box>
      </PageContent>
    </>
  );
}
