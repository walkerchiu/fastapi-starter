'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { useCreateScheduledTask, useTaskTypes } from '@/hooks/api';

interface TaskFormData {
  name: string;
  description: string;
  task_type: string;
  cron_expression: string;
  timezone: string;
  context: string;
  is_active: boolean;
}

export default function NewScheduledTaskPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: taskTypes, isLoading: typesLoading } = useTaskTypes();
  const createTaskMutation = useCreateScheduledTask();

  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    task_type: '',
    cron_expression: '',
    timezone: 'UTC',
    context: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    task_type?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTaskType = formData.task_type;

  const handleFormChange = (
    field: keyof TaskFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: undefined }));
    }
    if (field === 'task_type' && formErrors.task_type) {
      setFormErrors((prev) => ({ ...prev, task_type: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate
    const errors: { name?: string; task_type?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.task_type) {
      errors.task_type = 'Task type is required';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let contextParsed = null;
      if (formData.context.trim()) {
        try {
          contextParsed = JSON.parse(formData.context);
        } catch {
          setSubmitError('Invalid JSON in context field');
          setIsSubmitting(false);
          return;
        }
      }

      await createTaskMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        task_type: formData.task_type,
        cron_expression: formData.cron_expression || undefined,
        timezone: formData.timezone,
        context: contextParsed,
        is_active: formData.is_active,
      });

      router.push('/admin/tasks');
    } catch (err) {
      console.error('Failed to create task:', err);
      setSubmitError('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create Scheduled Task"
        description="Set up a new automated task"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Scheduled Tasks', href: '/admin/tasks' },
          { label: 'New Task' },
        ]}
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-6">
                {submitError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {submitError}
                  </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Basic Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="Enter task name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleFormChange('description', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe what this task does"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Task Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.task_type}
                      onChange={(e) =>
                        handleFormChange('task_type', e.target.value)
                      }
                      className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={typesLoading}
                    >
                      <option value="">Select a task type</option>
                      {taskTypes?.map((type) => (
                        <option key={type.type} value={type.type}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.task_type && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.task_type}
                      </p>
                    )}
                    {selectedTaskType && taskTypes && (
                      <p className="mt-1 text-sm text-gray-500">
                        {
                          taskTypes.find((t) => t.type === selectedTaskType)
                            ?.description
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Schedule
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cron Expression
                    </label>
                    <Input
                      value={formData.cron_expression}
                      onChange={(e) =>
                        handleFormChange('cron_expression', e.target.value)
                      }
                      placeholder="*/5 * * * *"
                      className="font-mono"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Examples: <code>*/5 * * * *</code> (every 5 min),{' '}
                      <code>0 * * * *</code> (hourly), <code>0 0 * * *</code>{' '}
                      (daily)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) =>
                        handleFormChange('timezone', e.target.value)
                      }
                      className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">
                        America/New_York (EST)
                      </option>
                      <option value="America/Los_Angeles">
                        America/Los_Angeles (PST)
                      </option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Asia/Taipei">Asia/Taipei (CST)</option>
                      <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                    </select>
                  </div>
                </div>

                {/* Context */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Task Context
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Context (JSON)
                    </label>
                    <textarea
                      value={formData.context}
                      onChange={(e) =>
                        handleFormChange('context', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={5}
                      placeholder='{"key": "value"}'
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Optional JSON object passed to the task handler
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Status
                  </h3>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        handleFormChange('is_active', e.target.checked)
                      }
                      id="is_active"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Enable task immediately after creation
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || createTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending
                      ? 'Creating...'
                      : 'Create Task'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
