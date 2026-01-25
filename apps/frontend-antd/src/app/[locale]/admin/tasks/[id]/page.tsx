'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';

import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  ConfirmDialog,
  type ColumnDef,
  type PaginationState,
} from '@/components/dashboard';
import { Badge } from '@/components/ui';
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

const { Text, Title } = Typography;
const { TextArea } = Input;

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TaskFormData>();

  // Reset form when task data loads
  useEffect(() => {
    if (task) {
      reset({
        name: task.name,
        description: task.description || '',
        cron_expression: task.cron_expression || '',
        timezone: task.timezone || 'UTC',
        context: task.context ? JSON.stringify(task.context, null, 2) : '',
      });
    }
  }, [task, reset]);

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
        return <Badge variant="secondary">Pending</Badge>;
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
        <Text type="secondary" style={{ fontSize: 13 }}>
          {formatDate(row.started_at)}
        </Text>
      ),
    },
    {
      key: 'completed_at',
      header: 'Completed',
      cell: (row) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {formatDate(row.completed_at)}
        </Text>
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
          <Text
            type="danger"
            style={{
              fontSize: 13,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 200,
              display: 'block',
            }}
          >
            {row.error_message}
          </Text>
        ) : (
          '-'
        ),
    },
  ];

  const onSubmit = async (data: TaskFormData) => {
    try {
      let contextParsed = null;
      if (data.context.trim()) {
        try {
          contextParsed = JSON.parse(data.context);
        } catch {
          alert('Invalid JSON in context field');
          return;
        }
      }

      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: {
          name: data.name,
          description: data.description || undefined,
          cron_expression: data.cron_expression || undefined,
          timezone: data.timezone,
          context: contextParsed,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
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

  if (isLoading) {
    return (
      <PageContent>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      </PageContent>
    );
  }

  if (error || !task) {
    return (
      <PageContent>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Text type="danger">Failed to load task details.</Text>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
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
          <Space>
            <Button
              onClick={() => setTriggerModalOpen(true)}
              disabled={!task.is_active}
            >
              Run Now
            </Button>
            <Button
              onClick={handleToggleStatus}
              loading={
                enableTaskMutation.isPending || disableTaskMutation.isPending
              }
            >
              {task.is_active ? 'Disable' : 'Enable'}
            </Button>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button danger onClick={() => setDeleteModalOpen(true)}>
              Delete
            </Button>
          </Space>
        }
      />
      <PageContent>
        <Row gutter={24}>
          {/* Task Info */}
          <Col xs={24}>
            <PageSection>
              <Card>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    Task Information
                  </Title>
                  <Badge variant={task.is_active ? 'success' : 'secondary'}>
                    {task.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Text type="secondary">Task Type</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue">{task.task_type}</Tag>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary">Schedule</Text>
                    <div style={{ marginTop: 4 }}>
                      {task.cron_expression ? (
                        <Text code>{task.cron_expression}</Text>
                      ) : task.scheduled_at ? (
                        <Text>{formatDate(task.scheduled_at)}</Text>
                      ) : (
                        <Text type="secondary">No schedule</Text>
                      )}
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary">Timezone</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{task.timezone}</Text>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary">Last Run</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{formatDate(task.last_run_at)}</Text>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary">Next Run</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>
                        {task.is_active ? formatDate(task.next_run_at) : '-'}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary">Created</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{formatDate(task.created_at)}</Text>
                    </div>
                  </Col>
                  {task.context && Object.keys(task.context).length > 0 && (
                    <Col xs={24}>
                      <Text type="secondary">Context</Text>
                      <pre
                        style={{
                          marginTop: 8,
                          padding: 12,
                          background: '#f5f5f5',
                          borderRadius: 6,
                          overflow: 'auto',
                          maxHeight: 200,
                          fontSize: 13,
                        }}
                      >
                        {JSON.stringify(task.context, null, 2)}
                      </pre>
                    </Col>
                  )}
                </Row>
              </Card>
            </PageSection>
          </Col>

          {/* Execution History */}
          <Col xs={24}>
            <PageSection>
              <Card>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Execution History
                </Title>
                <DataTable
                  columns={executionColumns}
                  data={executions}
                  getRowKey={(row) => row.id}
                  loading={executionsLoading}
                  pagination={executionsPagination}
                  onPaginationChange={setExecutionsPagination}
                  emptyState={
                    <div style={{ padding: 32, textAlign: 'center' }}>
                      <Text type="secondary">No executions recorded yet.</Text>
                    </div>
                  }
                />
              </Card>
            </PageSection>
          </Col>
        </Row>
      </PageContent>

      {/* Edit Modal */}
      <Modal
        title="Edit Scheduled Task"
        open={isEditing}
        onCancel={() => {
          setIsEditing(false);
          reset();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsEditing(false);
              reset();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty}
            loading={updateTaskMutation.isPending}
          >
            {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>,
        ]}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Name"
            required
            validateStatus={errors.name ? 'error' : undefined}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <Input {...field} placeholder="Task name" />
              )}
            />
          </Form.Item>

          <Form.Item label="Description">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea {...field} rows={3} placeholder="Task description" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Cron Expression"
            help="Leave empty for one-time tasks"
          >
            <Controller
              name="cron_expression"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="*/5 * * * *" />
              )}
            />
          </Form.Item>

          <Form.Item label="Timezone">
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => <Input {...field} placeholder="UTC" />}
            />
          </Form.Item>

          <Form.Item label="Context (JSON)">
            <Controller
              name="context"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={4}
                  placeholder='{"key": "value"}'
                  style={{ fontFamily: 'monospace' }}
                />
              )}
            />
          </Form.Item>
        </Form>
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
