'use client';

import { useState, useMemo } from 'react';
import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@/components/dashboard';
import { Badge, Button, Card, CardBody, Input, Modal } from '@/components/ui';
import { useAuditLogs } from '@/hooks/api';

interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [sorting, setSorting] = useState<SortingState | undefined>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch audit logs with current filters
  const { data, isLoading, error } = useAuditLogs({
    page: pagination.page,
    limit: pagination.pageSize,
    search: search || undefined,
    action: actionFilter || undefined,
    resource: resourceFilter || undefined,
    sortBy: sorting?.key,
    sortOrder: sorting?.direction,
  });

  // Update pagination when data changes
  const logs = useMemo(() => {
    if (data?.data) {
      setPagination((prev) => ({
        ...prev,
        total: data.meta?.total || data.data.length,
      }));
      return data.data as AuditLog[];
    }
    return [];
  }, [data]);

  // Get action badge variant
  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return { variant: 'success' as const, label: action };
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return { variant: 'info' as const, label: action };
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return { variant: 'error' as const, label: action };
    }
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return { variant: 'warning' as const, label: action };
    }
    return { variant: 'neutral' as const, label: action };
  };

  // Table columns
  const columns: ColumnDef<AuditLog>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Time',
        sortable: true,
        cell: (row) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {new Date(row.createdAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(row.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ),
      },
      {
        key: 'user',
        header: 'User',
        cell: (row) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {row.userName || 'System'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.userEmail || '-'}
            </span>
          </div>
        ),
      },
      {
        key: 'action',
        header: 'Action',
        cell: (row) => {
          const badge = getActionBadge(row.action);
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        },
      },
      {
        key: 'resource',
        header: 'Resource',
        cell: (row) => (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {row.resource}
            </span>
            {row.resourceId && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {row.resourceId.substring(0, 8)}...
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'ipAddress',
        header: 'IP Address',
        cell: (row) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {row.ipAddress || '-'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        cell: (row) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLog(row);
              setDetailsModalOpen(true);
            }}
          >
            Details
          </Button>
        ),
      },
    ],
    [],
  );

  // Get unique actions and resources for filters
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach((log) => actions.add(log.action));
    return Array.from(actions).sort();
  }, [logs]);

  const uniqueResources = useMemo(() => {
    const resources = new Set<string>();
    logs.forEach((log) => resources.add(log.resource));
    return Array.from(resources).sort();
  }, [logs]);

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="View system activity and user actions"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Audit Logs' },
        ]}
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardBody>
              {/* Filters */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Input
                  type="search"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:max-w-xs"
                />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
                <select
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">All Resources</option>
                  {uniqueResources.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
                {(search || actionFilter || resourceFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setActionFilter('');
                      setResourceFilter('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Error state */}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Failed to load audit logs. Please try again.
                  </p>
                </div>
              )}

              {/* Data table */}
              <DataTable
                columns={columns}
                data={logs}
                getRowKey={(row) => row.id}
                loading={isLoading}
                sorting={sorting}
                onSortingChange={setSorting}
                pagination={pagination}
                onPaginationChange={setPagination}
                onRowClick={(row) => {
                  setSelectedLog(row);
                  setDetailsModalOpen(true);
                }}
                emptyState={
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No audit logs found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {search || actionFilter || resourceFilter
                        ? 'Try adjusting your filters.'
                        : 'No system activity has been recorded yet.'}
                    </p>
                  </div>
                }
              />
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>

      {/* Details modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedLog(null);
        }}
        title="Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Time
                </span>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Action
                </span>
                <p className="mt-1">
                  {(() => {
                    const badge = getActionBadge(selectedLog.action);
                    return <Badge variant={badge.variant}>{badge.label}</Badge>;
                  })()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User
                </span>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedLog.userName || 'System'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedLog.userEmail || '-'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Resource
                </span>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedLog.resource}
                </p>
                {selectedLog.resourceId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {selectedLog.resourceId}
                  </p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  IP Address
                </span>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedLog.ipAddress || '-'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User Agent
                </span>
                <p className="mt-1 truncate text-xs text-gray-900 dark:text-gray-100">
                  {selectedLog.userAgent || '-'}
                </p>
              </div>
            </div>

            {selectedLog.details &&
              Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Details
                  </span>
                  <pre className="mt-2 overflow-auto rounded-lg bg-gray-100 p-4 text-xs text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setDetailsModalOpen(false);
              setSelectedLog(null);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
