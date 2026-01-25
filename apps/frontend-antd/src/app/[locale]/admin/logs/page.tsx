'use client';

import { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Modal,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  EmptyState,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@/components/dashboard';
import { useAuditLogs } from '@/hooks/api';

const { Text } = Typography;

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

  // Get action tag color
  const getActionTag = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return { color: 'success', label: action };
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return { color: 'processing', label: action };
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return { color: 'error', label: action };
    }
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return { color: 'warning', label: action };
    }
    return { color: 'default', label: action };
  };

  // Table columns
  const columns: ColumnDef<AuditLog>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Time',
        sortable: true,
        cell: (row) => (
          <div>
            <Text strong style={{ display: 'block' }}>
              {new Date(row.createdAt).toLocaleDateString()}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(row.createdAt).toLocaleTimeString()}
            </Text>
          </div>
        ),
      },
      {
        key: 'user',
        header: 'User',
        cell: (row) => (
          <div>
            <Text strong style={{ display: 'block' }}>
              {row.userName || 'System'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.userEmail || '-'}
            </Text>
          </div>
        ),
      },
      {
        key: 'action',
        header: 'Action',
        cell: (row) => {
          const tag = getActionTag(row.action);
          return <Tag color={tag.color}>{tag.label}</Tag>;
        },
      },
      {
        key: 'resource',
        header: 'Resource',
        cell: (row) => (
          <div>
            <Text style={{ display: 'block' }}>{row.resource}</Text>
            {row.resourceId && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                ID: {row.resourceId.substring(0, 8)}...
              </Text>
            )}
          </div>
        ),
      },
      {
        key: 'ipAddress',
        header: 'IP Address',
        cell: (row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {row.ipAddress || '-'}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: 100,
        cell: (row) => (
          <Button
            type="text"
            size="small"
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

  const clearFilters = () => {
    setSearch('');
    setActionFilter('');
    setResourceFilter('');
  };

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
            toolbar={
              <Space wrap style={{ width: '100%' }}>
                <Input
                  placeholder="Search logs..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 200 }}
                  allowClear
                />
                <Select
                  placeholder="All Actions"
                  value={actionFilter || undefined}
                  onChange={(value) => setActionFilter(value || '')}
                  style={{ width: 150 }}
                  allowClear
                  options={uniqueActions.map((action) => ({
                    value: action,
                    label: action,
                  }))}
                />
                <Select
                  placeholder="All Resources"
                  value={resourceFilter || undefined}
                  onChange={(value) => setResourceFilter(value || '')}
                  style={{ width: 150 }}
                  allowClear
                  options={uniqueResources.map((resource) => ({
                    value: resource,
                    label: resource,
                  }))}
                />
                {(search || actionFilter || resourceFilter) && (
                  <Button icon={<ClearOutlined />} onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </Space>
            }
            emptyState={
              <EmptyState
                icon={
                  <FileTextOutlined style={{ fontSize: 48, color: '#999' }} />
                }
                title="No audit logs found"
                description={
                  search || actionFilter || resourceFilter
                    ? 'Try adjusting your filters.'
                    : 'No system activity has been recorded yet.'
                }
              />
            }
          />

          {/* Error state */}
          {error && (
            <Alert
              type="error"
              style={{ marginTop: 16 }}
              message="Failed to load audit logs. Please try again."
            />
          )}
        </PageSection>
      </PageContent>

      {/* Details modal */}
      <Modal
        open={detailsModalOpen}
        onCancel={() => {
          setDetailsModalOpen(false);
          setSelectedLog(null);
        }}
        title="Log Details"
        width={700}
        footer={
          <Button
            onClick={() => {
              setDetailsModalOpen(false);
              setSelectedLog(null);
            }}
          >
            Close
          </Button>
        }
      >
        {selectedLog && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text
                  type="secondary"
                  strong
                  style={{ display: 'block', marginBottom: 4 }}
                >
                  Time
                </Text>
                <Text>{new Date(selectedLog.createdAt).toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text
                  type="secondary"
                  strong
                  style={{ display: 'block', marginBottom: 4 }}
                >
                  Action
                </Text>
                {(() => {
                  const tag = getActionTag(selectedLog.action);
                  return <Tag color={tag.color}>{tag.label}</Tag>;
                })()}
              </Col>
              <Col span={12}>
                <Text
                  type="secondary"
                  strong
                  style={{ display: 'block', marginBottom: 4 }}
                >
                  User
                </Text>
                <Text>{selectedLog.userName || 'System'}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedLog.userEmail || '-'}
                </Text>
              </Col>
              <Col span={12}>
                <Text
                  type="secondary"
                  strong
                  style={{ display: 'block', marginBottom: 4 }}
                >
                  Resource
                </Text>
                <Text>{selectedLog.resource}</Text>
                {selectedLog.resourceId && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ID: {selectedLog.resourceId}
                    </Text>
                  </>
                )}
              </Col>
              <Col span={12}>
                <Text
                  type="secondary"
                  strong
                  style={{ display: 'block', marginBottom: 4 }}
                >
                  IP Address
                </Text>
                <Text>{selectedLog.ipAddress || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text
                  type="secondary"
                  strong
                  style={{ display: 'block', marginBottom: 4 }}
                >
                  User Agent
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    display: 'block',
                    wordBreak: 'break-all',
                  }}
                  ellipsis={{ tooltip: selectedLog.userAgent }}
                >
                  {selectedLog.userAgent || '-'}
                </Text>
              </Col>
            </Row>

            {selectedLog.details &&
              Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Text
                    type="secondary"
                    strong
                    style={{ display: 'block', marginBottom: 8 }}
                  >
                    Details
                  </Text>
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                      fontSize: 12,
                      overflow: 'auto',
                      maxHeight: 200,
                    }}
                  >
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
          </Space>
        )}
      </Modal>
    </>
  );
}
