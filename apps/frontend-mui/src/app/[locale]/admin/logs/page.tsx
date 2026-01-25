'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArticleIcon from '@mui/icons-material/Article';

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
    skip: (pagination.page - 1) * pagination.pageSize,
    limit: pagination.pageSize,
    action: actionFilter || undefined,
    resource: resourceFilter || undefined,
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

  // Get action badge color
  const getActionBadgeColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return 'success' as const;
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'info' as const;
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'error' as const;
    }
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return 'warning' as const;
    }
    return 'default' as const;
  };

  // Table columns
  const columns: ColumnDef<AuditLog>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Time',
        sortable: true,
        cell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {new Date(row.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(row.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'user',
        header: 'User',
        cell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {row.userName || 'System'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.userEmail || '-'}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'action',
        header: 'Action',
        cell: (row) => (
          <Chip
            label={row.action}
            color={getActionBadgeColor(row.action)}
            size="small"
          />
        ),
      },
      {
        key: 'resource',
        header: 'Resource',
        cell: (row) => (
          <Box>
            <Typography variant="body2">{row.resource}</Typography>
            {row.resourceId && (
              <Typography variant="caption" color="text.secondary">
                ID: {row.resourceId.substring(0, 8)}...
              </Typography>
            )}
          </Box>
        ),
      },
      {
        key: 'ipAddress',
        header: 'IP Address',
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.ipAddress || '-'}
          </Typography>
        ),
      },
      {
        key: 'actions',
        header: '',
        cell: (row) => (
          <Button
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

  const handleClearFilters = () => {
    setSearch('');
    setActionFilter('');
    setResourceFilter('');
  };

  const hasFilters = search || actionFilter || resourceFilter;

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
          <Paper sx={{ p: 3 }}>
            {/* Filters */}
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { sm: 'center' },
              }}
            >
              <TextField
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ minWidth: 200, maxWidth: { sm: 250 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="">All Actions</MenuItem>
                  {uniqueActions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Resource</InputLabel>
                <Select
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  label="Resource"
                >
                  <MenuItem value="">All Resources</MenuItem>
                  {uniqueResources.map((resource) => (
                    <MenuItem key={resource} value={resource}>
                      {resource}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {hasFilters && (
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
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
                  Failed to load audit logs. Please try again.
                </Typography>
              </Paper>
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
                <EmptyState
                  icon={<ArticleIcon />}
                  title="No audit logs found"
                  description={
                    hasFilters
                      ? 'Try adjusting your filters.'
                      : 'No system activity has been recorded yet.'
                  }
                />
              }
            />
          </Paper>
        </PageSection>
      </PageContent>

      {/* Details dialog */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedLog(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Time
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Action
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedLog.action}
                      color={getActionBadgeColor(selectedLog.action)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    User
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedLog.userName || 'System'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedLog.userEmail || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Resource
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedLog.resource}
                  </Typography>
                  {selectedLog.resourceId && (
                    <Typography variant="caption" color="text.secondary">
                      ID: {selectedLog.resourceId}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    IP Address
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedLog.ipAddress || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    User Agent
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedLog.userAgent || '-'}
                  </Typography>
                </Grid>
              </Grid>

              {selectedLog.details &&
                Object.keys(selectedLog.details).length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Details
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        mt: 1,
                        p: 2,
                        bgcolor: 'grey.50',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      <Typography
                        component="pre"
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          m: 0,
                        }}
                      >
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </Typography>
                    </Paper>
                  </>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDetailsModalOpen(false);
              setSelectedLog(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
