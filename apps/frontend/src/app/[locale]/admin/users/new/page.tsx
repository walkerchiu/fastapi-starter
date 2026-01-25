'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  Input,
} from '@/components/ui';
import { useCreateUser, useRoles } from '@/hooks/api';
import { createUserSchema, type CreateUserInput } from '@/lib/validations';

export default function NewUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ limit: 100 });

  const {
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
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        }
      />
      <PageContent>
        <div className="mx-auto max-w-2xl">
          <PageSection>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  User Information
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the details for the new user account.
                </p>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <FormField label="Name" error={errors.name?.message} required>
                    {(props) => (
                      <Input
                        {...props}
                        {...register('name')}
                        placeholder="Enter user name"
                        autoComplete="name"
                      />
                    )}
                  </FormField>

                  <FormField
                    label="Email"
                    error={errors.email?.message}
                    required
                  >
                    {(props) => (
                      <Input
                        {...props}
                        {...register('email')}
                        type="email"
                        placeholder="Enter email address"
                        autoComplete="email"
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
                      <Input
                        {...props}
                        {...register('password')}
                        type="password"
                        placeholder="Enter password"
                        autoComplete="new-password"
                      />
                    )}
                  </FormField>

                  <FormField
                    label="Roles"
                    error={errors.roleIds?.message}
                    required
                  >
                    <div className="space-y-2">
                      {rolesLoading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Loading roles...
                        </p>
                      ) : (rolesData?.data?.length ?? 0) > 0 ? (
                        rolesData?.data?.map((role) => (
                          <label
                            key={role.id}
                            className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <input
                              type="checkbox"
                              value={role.id}
                              {...register('roleIds')}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <div>
                              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {role.name}
                              </span>
                              {role.description && (
                                <span className="block text-sm text-gray-500 dark:text-gray-400">
                                  {role.description}
                                </span>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No roles available
                        </p>
                      )}
                    </div>
                  </FormField>

                  <FormField label="Status">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                          Active
                        </span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          User can log in and access the system
                        </span>
                      </div>
                    </label>
                  </FormField>

                  {createUserMutation.isError && (
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Failed to create user. Please try again.
                      </p>
                    </div>
                  )}
                </form>
              </CardBody>
            </Card>
          </PageSection>
        </div>
      </PageContent>
    </>
  );
}
