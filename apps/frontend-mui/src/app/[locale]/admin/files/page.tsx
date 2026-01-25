'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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
import { useFiles, useDeleteFile, useUploadFile } from '@/hooks/api';
import type { File as FileItem } from '@/hooks/api/types';
import {
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/validations';

export default function FilesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorting, setSorting] = useState<SortingState | undefined>();
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Fetch files with current filters
  const { data, isLoading, error } = useFiles({
    skip: (pagination.page - 1) * pagination.pageSize,
    limit: pagination.pageSize,
  });

  const deleteFileMutation = useDeleteFile();
  const uploadFileMutation = useUploadFile();

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadErrors([]);
      const errors: string[] = [];

      for (const file of acceptedFiles) {
        if (!isValidFileType(file, ALLOWED_FILE_TYPES)) {
          errors.push(`${file.name}: Invalid file type`);
          continue;
        }
        if (!isValidFileSize(file, MAX_FILE_SIZE)) {
          errors.push(
            `${file.name}: File too large (max ${formatFileSize(MAX_FILE_SIZE)})`,
          );
          continue;
        }

        try {
          await uploadFileMutation.mutateAsync(file);
        } catch {
          errors.push(`${file.name}: Upload failed`);
        }
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
      }
    },
    [uploadFileMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
  });

  // Update pagination when data changes
  const files = useMemo(() => {
    if (data?.data) {
      setPagination((prev) => ({
        ...prev,
        total: data.meta?.total || data.data.length,
      }));
      return data.data as FileItem[];
    }
    return [];
  }, [data]);

  // Get file type badge variant
  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return { color: 'success' as const, label: 'Image' };
    }
    if (mimeType === 'application/pdf') {
      return { color: 'error' as const, label: 'PDF' };
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return { color: 'info' as const, label: 'Document' };
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return { color: 'warning' as const, label: 'Spreadsheet' };
    }
    return { color: 'default' as const, label: 'File' };
  };

  // Table columns
  const columns: ColumnDef<FileItem>[] = useMemo(
    () => [
      {
        key: 'filename',
        header: 'File',
        sortable: true,
        cell: (row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {row.thumbnailUrl ? (
              <Box
                component="img"
                src={row.thumbnailUrl}
                alt={row.filename}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                }}
              >
                <InsertDriveFileIcon color="action" />
              </Box>
            )}
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {row.originalName || row.filename}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.filename}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        key: 'mimeType',
        header: 'Type',
        cell: (row) => {
          const badge = getFileTypeBadge(row.mimeType);
          return <Chip label={badge.label} color={badge.color} size="small" />;
        },
      },
      {
        key: 'size',
        header: 'Size',
        sortable: true,
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(row.size)}
          </Typography>
        ),
      },
      {
        key: 'createdAt',
        header: 'Uploaded',
        sortable: true,
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
          </Typography>
        ),
      },
      {
        key: 'actions',
        header: '',
        cell: (row) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.url, '_blank');
              }}
            >
              Download
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/files/${row.id}`);
              }}
            >
              View
            </Button>
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setFileToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [router],
  );

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      await deleteFileMutation.mutateAsync(fileToDelete.id);
      setDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(selectedRows);
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((id) => deleteFileMutation.mutateAsync(id)),
      );
      setSelectedRows({});
    } catch (error) {
      console.error('Failed to delete files:', error);
    }
  };

  const selectedCount = Object.keys(selectedRows).length;

  return (
    <>
      <PageHeader
        title="Files"
        description="Manage uploaded files and documents"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Files' }]}
      />
      <PageContent>
        {/* Upload area */}
        <PageSection>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upload Files
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                bgcolor: isDragActive ? 'primary.lighter' : 'transparent',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'grey.400',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
              />
              <Typography variant="body1" color="text.secondary">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag and drop files here, or click to select files'}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                display="block"
                sx={{ mt: 1 }}
              >
                Images (JPEG, PNG, GIF, WebP) and documents (PDF, Word, Excel)
                up to {formatFileSize(MAX_FILE_SIZE)}
              </Typography>
              {uploadFileMutation.isPending && (
                <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                  Uploading...
                </Typography>
              )}
            </Box>
            {uploadErrors.length > 0 && (
              <Paper
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'error.lighter',
                }}
                variant="outlined"
              >
                <List dense disablePadding>
                  {uploadErrors.map((error, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText
                        primary={error}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'error.main',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Paper>
        </PageSection>

        {/* File list */}
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
              <TextField
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ maxWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {selectedCount > 0 && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {selectedCount} selected
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    disabled={deleteFileMutation.isPending}
                  >
                    Delete Selected
                  </Button>
                </Stack>
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
                  Failed to load files. Please try again.
                </Typography>
              </Paper>
            )}

            {/* Data table */}
            <DataTable
              columns={columns}
              data={files}
              getRowKey={(row) => row.id}
              loading={isLoading}
              sorting={sorting}
              onSortingChange={setSorting}
              pagination={pagination}
              onPaginationChange={setPagination}
              rowSelection={selectedRows}
              onRowSelectionChange={setSelectedRows}
              onRowClick={(row) => router.push(`/admin/files/${row.id}`)}
              emptyState={
                <EmptyState
                  icon={<InsertDriveFileIcon />}
                  title="No files found"
                  description="Upload files using the dropzone above."
                />
              }
            />
          </Paper>
        </PageSection>
      </PageContent>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
        title="Delete File"
        description={`Are you sure you want to delete ${fileToDelete?.originalName || fileToDelete?.filename}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteFileMutation.isPending}
      />
    </>
  );
}
