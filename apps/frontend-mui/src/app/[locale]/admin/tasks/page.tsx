'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';

import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  ConfirmDialog,
  EmptyState,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@/components/dashboard';
import { Link } from '@/i18n/routing';
import {
  useScheduledTasks,
  useDeleteScheduledTask,
  useEnableScheduledTask,
  useDisableScheduledTask,
  useTriggerScheduledTask,
  type ScheduledTask,
} from '@/hooks/api';

export default function ScheduledTasksPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorting, setSorting] = useState<SortingState | undefined>();
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ScheduledTask | null>(null);
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [taskToTrigger, setTaskToTrigger] = useState<ScheduledTask | null>(
    null,
  );

  // Fetch scheduled tasks
  const { data, isLoading, error } = useScheduledTasks({
    page: pagination.page,
    limit: pagination.pageSize,
    is_active:
      statusFilter === 'active'
        ? true
        : statusFilter === 'inactive'
          ? false
          : undefined,
  });

  const deleteTaskMutation = useDeleteScheduledTask();
  const enableTaskMutation = useEnableScheduledTask();
  const disableTaskMutation = useDisableScheduledTask();
  const triggerTaskMutation = useTriggerScheduledTask();

  // Process tasks data
  const tasks = useMemo(() => {
    if (data?.data) {
      setPagination((prev) => ({
        ...prev,
        total: data.meta?.total || data.data.length,
      }));
      // Client-side search filter
      if (search) {
        return data.data.filter(
          (task: ScheduledTask) =>
            task.name.toLowerCase().includes(search.toLowerCase()) ||
            task.task_type.toLowerCase().includes(search.toLowerCase()),
        );
      }
      return data.data as ScheduledTask[];
    }
    return [];
  }, [data, search]);

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  // Table columns
  const columns: ColumnDef<ScheduledTask>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Task Name',
        sortable: true,
        cell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {row.name}
            </Typography>
            {row.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 250,
                }}
              >
                {row.description}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        key: 'task_type',
        header: 'Type',
        cell: (row) => <Chip label={row.task_type} size="small" color="info" />,
      },
      {
        key: 'schedule',
        header: 'Schedule',
        cell: (row) => (
          <Box>
            {row.cron_expression ? (
              <Typography
                variant="caption"
                component="code"
                sx={{
                  bgcolor: 'grey.100',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                }}
              >
                {row.cron_expression}
              </Typography>
            ) : row.scheduled_at ? (
              <Typography variant="body2" color="text.secondary">
                {formatDate(row.scheduled_at)}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.disabled">
                No schedule
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled" display="block">
              {row.timezone}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'is_active',
        header: 'Status',
        cell: (row) => (
          <Chip
            label={row.is_active ? 'Active' : 'Inactive'}
            size="small"
            color={row.is_active ? 'success' : 'default'}
          />
        ),
      },
      {
        key: 'last_run_at',
        header: 'Last Run',
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(row.last_run_at)}
          </Typography>
        ),
      },
      {
        key: 'next_run_at',
        header: 'Next Run',
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.is_active ? formatDate(row.next_run_at) : '-'}
          </Typography>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: 250,
        cell: (row) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setTaskToTrigger(row);
                setTriggerModalOpen(true);
              }}
              disabled={!row.is_active}
            >
              Run Now
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (row.is_active) {
                  disableTaskMutation.mutate(row.id);
                } else {
                  enableTaskMutation.mutate(row.id);
                }
              }}
            >
              {row.is_active ? 'Disable' : 'Enable'}
            </Button>
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setTaskToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [disableTaskMutation, enableTaskMutation],
  );

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleTriggerTask = async () => {
    if (!taskToTrigger) return;
    try {
      await triggerTaskMutation.mutateAsync(taskToTrigger.id);
      setTriggerModalOpen(false);
      setTaskToTrigger(null);
    } catch (err) {
      console.error('Failed to trigger task:', err);
    }
  };

  return (
    <>
      <PageHeader
        title="Scheduled Tasks"
        description="Manage automated scheduled tasks and cron jobs"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Scheduled Tasks' },
        ]}
        actions={
          <Link href="/admin/tasks/new">
            <Button variant="contained" startIcon={<AddIcon />}>
              Add Task
            </Button>
          </Link>
        }
      />
      <PageContent>
        <PageSection>
          <Paper sx={{ p: 3 }}>
            {/* Toolbar */}
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  placeholder="Search tasks..."
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
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            {/* Error state */}
            {error && (
              <Paper
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: 'error.lighter',
                  borderColor: 'error.light',
                }}
                variant="outlined"
              >
                <Typography variant="body2" color="error.main">
                  Failed to load scheduled tasks. Please try again.
                </Typography>
              </Paper>
            )}

            {/* Data table */}
            <DataTable
              columns={columns}
              data={tasks}
              getRowKey={(row) => row.id}
              loading={isLoading}
              sorting={sorting}
              onSortingChange={setSorting}
              pagination={pagination}
              onPaginationChange={setPagination}
              rowSelection={selectedRows}
              onRowSelectionChange={setSelectedRows}
              onRowClick={(row) => router.push(`/admin/tasks/${row.id}`)}
              emptyState={
                <EmptyState
                  icon={<ScheduleIcon sx={{ fontSize: 48 }} />}
                  title="No scheduled tasks"
                  description="Get started by creating your first scheduled task."
                  action={
                    <Link href="/admin/tasks/new">
                      <Button variant="contained">Create Task</Button>
                    </Link>
                  }
                />
              }
            />
          </Paper>
        </PageSection>
      </PageContent>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
        title="Delete Scheduled Task"
        description={`Are you sure you want to delete "${taskToDelete?.name}"? This action cannot be undone.`}
        confirmText={deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteTaskMutation.isPending}
      />

      {/* Trigger confirmation modal */}
      <ConfirmDialog
        open={triggerModalOpen}
        onClose={() => {
          setTriggerModalOpen(false);
          setTaskToTrigger(null);
        }}
        onConfirm={handleTriggerTask}
        title="Run Task Now"
        description={`Are you sure you want to run "${taskToTrigger?.name}" immediately?`}
        confirmText={triggerTaskMutation.isPending ? 'Running...' : 'Run Now'}
        variant="default"
        loading={triggerTaskMutation.isPending}
      />
    </>
  );
}
