'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Badge, Button, Input } from '@/components/ui';
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
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {row.name}
            </span>
            {row.description && (
              <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {row.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'task_type',
        header: 'Type',
        cell: (row) => <Badge variant="info">{row.task_type}</Badge>,
      },
      {
        key: 'schedule',
        header: 'Schedule',
        cell: (row) => (
          <div className="flex flex-col text-sm">
            {row.cron_expression ? (
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                {row.cron_expression}
              </code>
            ) : row.scheduled_at ? (
              <span className="text-gray-600 dark:text-gray-400">
                {formatDate(row.scheduled_at)}
              </span>
            ) : (
              <span className="text-gray-400">No schedule</span>
            )}
            <span className="text-gray-400 text-xs mt-1">{row.timezone}</span>
          </div>
        ),
      },
      {
        key: 'is_active',
        header: 'Status',
        cell: (row) => (
          <Badge variant={row.is_active ? 'success' : 'neutral'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        key: 'last_run_at',
        header: 'Last Run',
        cell: (row) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(row.last_run_at)}
          </span>
        ),
      },
      {
        key: 'next_run_at',
        header: 'Next Run',
        cell: (row) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.is_active ? formatDate(row.next_run_at) : '-'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: 200,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
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
              variant="ghost"
              size="sm"
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
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                setTaskToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
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
            <Button>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Task
            </Button>
          </Link>
        }
      />
      <PageContent>
        <PageSection>
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
            toolbar={
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            }
            emptyState={
              <EmptyState
                icon={
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                title="No scheduled tasks"
                description="Get started by creating your first scheduled task."
                action={
                  <Link href="/admin/tasks/new">
                    <Button>Create Task</Button>
                  </Link>
                }
              />
            }
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              Failed to load scheduled tasks. Please try again.
            </div>
          )}
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
