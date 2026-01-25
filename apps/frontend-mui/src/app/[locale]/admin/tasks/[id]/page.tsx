'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

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
  const getExecutionStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" size="small" color="success" />;
      case 'failed':
        return <Chip label="Failed" size="small" color="error" />;
      case 'running':
        return <Chip label="Running" size="small" color="warning" />;
      default:
        return <Chip label="Pending" size="small" />;
    }
  };

  // Execution table columns
  const executionColumns: ColumnDef<TaskExecution>[] = [
    {
      key: 'status',
      header: 'Status',
      cell: (row) => getExecutionStatusChip(row.status),
    },
    {
      key: 'started_at',
      header: 'Started',
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(row.started_at)}
        </Typography>
      ),
    },
    {
      key: 'completed_at',
      header: 'Completed',
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(row.completed_at)}
        </Typography>
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
          <Typography
            variant="body2"
            color="error"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 200,
            }}
          >
            {row.error_message}
          </Typography>
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
        <Box display="flex" justifyContent="center" alignItems="center" py={6}>
          <CircularProgress />
        </Box>
      </PageContent>
    );
  }

  if (error || !task) {
    return (
      <PageContent>
        <Box textAlign="center" py={6}>
          <Typography color="error" gutterBottom>
            Failed to load task details.
          </Typography>
          <Button variant="contained" onClick={() => router.back()}>
            Go Back
          </Button>
        </Box>
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
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => setTriggerModalOpen(true)}
              disabled={!task.is_active}
            >
              Run Now
            </Button>
            <Button
              variant="outlined"
              onClick={handleToggleStatus}
              disabled={
                enableTaskMutation.isPending || disableTaskMutation.isPending
              }
            >
              {task.is_active ? 'Disable' : 'Enable'}
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        }
      />
      <PageContent>
        <Grid container spacing={3}>
          {/* Task Info */}
          <Grid item xs={12}>
            <PageSection>
              <Card>
                <CardHeader
                  title="Task Information"
                  action={
                    <Chip
                      label={task.is_active ? 'Active' : 'Inactive'}
                      color={task.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  }
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Task Type
                      </Typography>
                      <Box mt={0.5}>
                        <Chip
                          label={task.task_type}
                          size="small"
                          color="info"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Schedule
                      </Typography>
                      <Typography variant="body1" mt={0.5}>
                        {task.cron_expression ? (
                          <Box
                            component="code"
                            sx={{
                              bgcolor: 'grey.100',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontFamily: 'monospace',
                            }}
                          >
                            {task.cron_expression}
                          </Box>
                        ) : task.scheduled_at ? (
                          formatDate(task.scheduled_at)
                        ) : (
                          'No schedule'
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Timezone
                      </Typography>
                      <Typography variant="body1" mt={0.5}>
                        {task.timezone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last Run
                      </Typography>
                      <Typography variant="body1" mt={0.5}>
                        {formatDate(task.last_run_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Next Run
                      </Typography>
                      <Typography variant="body1" mt={0.5}>
                        {task.is_active ? formatDate(task.next_run_at) : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body1" mt={0.5}>
                        {formatDate(task.created_at)}
                      </Typography>
                    </Grid>
                    {task.context && Object.keys(task.context).length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Context
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            mt: 1,
                            p: 2,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: 200,
                            fontFamily: 'monospace',
                            fontSize: 13,
                          }}
                        >
                          {JSON.stringify(task.context, null, 2)}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </PageSection>
          </Grid>

          {/* Execution History */}
          <Grid item xs={12}>
            <PageSection>
              <Card>
                <CardHeader title="Execution History" />
                <Divider />
                <DataTable
                  columns={executionColumns}
                  data={executions}
                  getRowKey={(row) => row.id}
                  loading={executionsLoading}
                  pagination={executionsPagination}
                  onPaginationChange={setExecutionsPagination}
                  emptyState={
                    <Box py={4} textAlign="center">
                      <Typography color="text.secondary">
                        No executions recorded yet.
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </PageSection>
          </Grid>
        </Grid>
      </PageContent>

      {/* Edit Dialog */}
      <Dialog
        open={isEditing}
        onClose={() => {
          setIsEditing(false);
          reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Scheduled Task</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2 }}
          >
            <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />

              <Controller
                name="cron_expression"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cron Expression"
                    fullWidth
                    placeholder="*/5 * * * *"
                    helperText="Leave empty for one-time tasks"
                  />
                )}
              />

              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Timezone"
                    fullWidth
                    placeholder="UTC"
                  />
                )}
              />

              <Controller
                name="context"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Context (JSON)"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder='{"key": "value"}'
                    InputProps={{
                      sx: { fontFamily: 'monospace' },
                    }}
                  />
                )}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsEditing(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || updateTaskMutation.isPending}
          >
            {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

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
