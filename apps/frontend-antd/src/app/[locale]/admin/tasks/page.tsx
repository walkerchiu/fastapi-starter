'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Space, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

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
import { Badge } from '@/components/ui';
import {
  useScheduledTasks,
  useDeleteScheduledTask,
  useEnableScheduledTask,
  useDisableScheduledTask,
  useTriggerScheduledTask,
  type ScheduledTask,
} from '@/hooks/api';

const { Text } = Typography;

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
          <div>
            <Text strong style={{ display: 'block' }}>
              {row.name}
            </Text>
            {row.description && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 250,
                }}
              >
                {row.description}
              </Text>
            )}
          </div>
        ),
      },
      {
        key: 'task_type',
        header: 'Type',
        cell: (row) => <Tag color="blue">{row.task_type}</Tag>,
      },
      {
        key: 'schedule',
        header: 'Schedule',
        cell: (row) => (
          <div>
            {row.cron_expression ? (
              <Text
                code
                style={{
                  fontSize: 12,
                }}
              >
                {row.cron_expression}
              </Text>
            ) : row.scheduled_at ? (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {formatDate(row.scheduled_at)}
              </Text>
            ) : (
              <Text type="secondary">No schedule</Text>
            )}
            <Text
              type="secondary"
              style={{ fontSize: 11, display: 'block', marginTop: 2 }}
            >
              {row.timezone}
            </Text>
          </div>
        ),
      },
      {
        key: 'is_active',
        header: 'Status',
        cell: (row) => (
          <Badge variant={row.is_active ? 'success' : 'secondary'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        key: 'last_run_at',
        header: 'Last Run',
        cell: (row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {formatDate(row.last_run_at)}
          </Text>
        ),
      },
      {
        key: 'next_run_at',
        header: 'Next Run',
        cell: (row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {row.is_active ? formatDate(row.next_run_at) : '-'}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: 250,
        cell: (row) => (
          <Space>
            <Button
              type="text"
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
              type="text"
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
              type="text"
              size="small"
              danger
              onClick={(e) => {
                e.stopPropagation();
                setTaskToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </Space>
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
            <Button type="primary" icon={<PlusOutlined />}>
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <Space>
                  <Input
                    placeholder="Search tasks..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 250 }}
                    allowClear
                  />
                  <Select
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    style={{ width: 150 }}
                    placeholder="All Status"
                    allowClear
                  >
                    <Select.Option value="">All Status</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                </Space>
              </div>
            }
            emptyState={
              <EmptyState
                icon={
                  <ClockCircleOutlined
                    style={{ fontSize: 48, color: '#999' }}
                  />
                }
                title="No scheduled tasks"
                description="Get started by creating your first scheduled task."
                action={
                  <Link href="/admin/tasks/new">
                    <Button type="primary">Create Task</Button>
                  </Link>
                }
              />
            }
          />

          {/* Error state */}
          {error && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: '#fff2f0',
                borderRadius: 8,
              }}
            >
              <Text type="danger">
                Failed to load scheduled tasks. Please try again.
              </Text>
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
