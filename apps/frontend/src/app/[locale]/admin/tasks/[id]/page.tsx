'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  ConfirmDialog,
  type ColumnDef,
  type PaginationState,
} from '@/components/dashboard';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
} from '@/components/ui';
import {
  useScheduledTask,
  useTaskExecutions,
  useUpdateScheduledTask,
  useDeleteScheduledTask,
  useEnableScheduledTask,
  useDisableScheduledTask,
  useTriggerScheduledTask,
  type TaskExecution,
} from '@/hooks/api';

interface TaskFormData {
  name: string;
  description: string;
  cron_expression: string;
  timezone: string;
  context: string;
}

export default function ScheduledTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params['id'] as string;

  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [executionsPagination, setExecutionsPagination] =
    useState<PaginationState>({
      page: 1,
      pageSize: 10,
      total: 0,
    });

  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    cron_expression: '',
    timezone: 'UTC',
    context: '',
  });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch task data
  const { data: task, isLoading, error } = useScheduledTask(taskId);
  const { data: executionsData, isLoading: executionsLoading } =
    useTaskExecutions(taskId, {
      page: executionsPagination.page,
      limit: executionsPagination.pageSize,
    });

  const updateTaskMutation = useUpdateScheduledTask();
  const deleteTaskMutation = useDeleteScheduledTask();
  const enableTaskMutation = useEnableScheduledTask();
  const disableTaskMutation = useDisableScheduledTask();
  const triggerTaskMutation = useTriggerScheduledTask();

  // Reset form when task data loads
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        cron_expression: task.cron_expression || '',
        timezone: task.timezone || 'UTC',
        context: task.context ? JSON.stringify(task.context, null, 2) : '',
      });
    }
  }, [task]);

  // Process executions
  const executions = executionsData?.data || [];
  useEffect(() => {
    if (executionsData?.meta) {
      setExecutionsPagination((prev) => ({
        ...prev,
        total: executionsData.meta.total,
      }));
    }
  }, [executionsData]);

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  // Execution status badge
  const getExecutionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'running':
        return <Badge variant="warning">Running</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  // Execution table columns
  const executionColumns: ColumnDef<TaskExecution>[] = [
    {
      key: 'status',
      header: 'Status',
      cell: (row) => getExecutionStatusBadge(row.status),
    },
    {
      key: 'started_at',
      header: 'Started',
      cell: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(row.started_at)}
        </span>
      ),
    },
    {
      key: 'completed_at',
      header: 'Completed',
      cell: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(row.completed_at)}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      cell: (row) => {
        if (!row.started_at || !row.completed_at) return '-';
        const duration =
          new Date(row.completed_at).getTime() -
          new Date(row.started_at).getTime();
        return `${(duration / 1000).toFixed(2)}s`;
      },
    },
    {
      key: 'error_message',
      header: 'Error',
      cell: (row) =>
        row.error_message ? (
          <span className="text-sm text-red-600 dark:text-red-400 truncate max-w-xs block">
            {row.error_message}
          </span>
        ) : (
          '-'
        ),
    },
  ];

  const handleFormChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Name is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      let contextParsed = null;
      if (formData.context.trim()) {
        try {
          contextParsed = JSON.parse(formData.context);
        } catch {
          alert('Invalid JSON in context field');
          setIsSubmitting(false);
          return;
        }
      }

      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          cron_expression: formData.cron_expression || undefined,
          timezone: formData.timezone,
          context: contextParsed,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      router.push('/admin/tasks');
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleTrigger = async () => {
    try {
      await triggerTaskMutation.mutateAsync(taskId);
      setTriggerModalOpen(false);
    } catch (err) {
      console.error('Failed to trigger task:', err);
    }
  };

  const handleToggleStatus = () => {
    if (task?.is_active) {
      disableTaskMutation.mutate(taskId);
    } else {
      enableTaskMutation.mutate(taskId);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        cron_expression: task.cron_expression || '',
        timezone: task.timezone || 'UTC',
        context: task.context ? JSON.stringify(task.context, null, 2) : '',
      });
    }
    setFormErrors({});
  };

  if (isLoading) {
    return (
      <PageContent>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageContent>
    );
  }

  if (error || !task) {
    return (
      <PageContent>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Failed to load task details.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </PageContent>
    );
  }

  return (
    <>
      <PageHeader
        title={task.name}
        description={task.description || 'No description'}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Scheduled Tasks', href: '/admin/tasks' },
          { label: task.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTriggerModalOpen(true);
              }}
              disabled={!task.is_active}
            >
              Run Now
            </Button>
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={
                enableTaskMutation.isPending || disableTaskMutation.isPending
              }
            >
              {task.is_active ? 'Disable' : 'Enable'}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />
      <PageContent>
        {/* Task Info */}
        <PageSection>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Task Information
                </h3>
                <Badge variant={task.is_active ? 'success' : 'neutral'}>
                  {task.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Task Type
                  </dt>
                  <dd className="mt-1">
                    <Badge variant="info">{task.task_type}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Schedule
                  </dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">
                    {task.cron_expression ? (
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                        {task.cron_expression}
                      </code>
                    ) : task.scheduled_at ? (
                      formatDate(task.scheduled_at)
                    ) : (
                      'No schedule'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Timezone
                  </dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">
                    {task.timezone}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Run
                  </dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">
                    {formatDate(task.last_run_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Next Run
                  </dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">
                    {task.is_active ? formatDate(task.next_run_at) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">
                    {formatDate(task.created_at)}
                  </dd>
                </div>
                {task.context && Object.keys(task.context).length > 0 && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Context
                    </dt>
                    <dd className="mt-1">
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto max-h-40">
                        {JSON.stringify(task.context, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>
        </PageSection>

        {/* Execution History */}
        <PageSection>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Execution History
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <DataTable
                columns={executionColumns}
                data={executions}
                getRowKey={(row) => row.id}
                loading={executionsLoading}
                pagination={executionsPagination}
                onPaginationChange={setExecutionsPagination}
                emptyState={
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No executions recorded yet.
                  </div>
                }
              />
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={handleCancelEdit}
        title="Edit Scheduled Task"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Task name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              rows={3}
              placeholder="Task description"
            />
          </div>

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
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for one-time tasks
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timezone
            </label>
            <Input
              value={formData.timezone}
              onChange={(e) => handleFormChange('timezone', e.target.value)}
              placeholder="UTC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Context (JSON)
            </label>
            <textarea
              value={formData.context}
              onChange={(e) => handleFormChange('context', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono"
              rows={4}
              placeholder='{"key": "value"}'
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Scheduled Task"
        description={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
        confirmText={deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteTaskMutation.isPending}
      />

      {/* Trigger confirmation modal */}
      <ConfirmDialog
        open={triggerModalOpen}
        onClose={() => setTriggerModalOpen(false)}
        onConfirm={handleTrigger}
        title="Run Task Now"
        description={`Are you sure you want to run "${task.name}" immediately?`}
        confirmText={triggerTaskMutation.isPending ? 'Running...' : 'Run Now'}
        variant="default"
        loading={triggerTaskMutation.isPending}
      />
    </>
  );
}
