'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button, Card, Input, Space, Tag, Typography, Alert } from 'antd';
import {
  SearchOutlined,
  CloudUploadOutlined,
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
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
import { useFiles, useDeleteFile, useUploadFile } from '@/hooks/api';
import type { File as FileItem } from '@/hooks/api/types';
import {
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/validations';

const { Text, Title } = Typography;

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

  // Get file type tag color
  const getFileTypeTag = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return { color: 'success', label: 'Image' };
    }
    if (mimeType === 'application/pdf') {
      return { color: 'error', label: 'PDF' };
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return { color: 'processing', label: 'Document' };
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return { color: 'warning', label: 'Spreadsheet' };
    }
    return { color: 'default', label: 'File' };
  };

  // Table columns
  const columns: ColumnDef<FileItem>[] = useMemo(
    () => [
      {
        key: 'filename',
        header: 'File',
        sortable: true,
        cell: (row) => (
          <Space>
            {row.thumbnailUrl ? (
              <img
                src={row.thumbnailUrl}
                alt={row.filename}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileOutlined style={{ fontSize: 20, color: '#999' }} />
              </div>
            )}
            <div>
              <Text strong style={{ display: 'block' }}>
                {row.originalName || row.filename}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {row.filename}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        key: 'mimeType',
        header: 'Type',
        cell: (row) => {
          const tag = getFileTypeTag(row.mimeType);
          return <Tag color={tag.color}>{tag.label}</Tag>;
        },
      },
      {
        key: 'size',
        header: 'Size',
        sortable: true,
        cell: (row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {formatFileSize(row.size)}
          </Text>
        ),
      },
      {
        key: 'createdAt',
        header: 'Uploaded',
        sortable: true,
        cell: (row) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: 200,
        cell: (row) => (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.url, '_blank');
              }}
            >
              Download
            </Button>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/files/${row.id}`);
              }}
            >
              View
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setFileToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </Space>
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
    } catch (err) {
      console.error('Failed to delete file:', err);
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
    } catch (err) {
      console.error('Failed to delete files:', err);
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
          <Card
            title={
              <Title level={5} style={{ margin: 0 }}>
                Upload Files
              </Title>
            }
          >
            <div
              {...getRootProps()}
              style={{
                padding: 32,
                textAlign: 'center',
                border: `2px dashed ${isDragActive ? '#1677ff' : '#d9d9d9'}`,
                borderRadius: 8,
                background: isDragActive ? '#e6f4ff' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadOutlined style={{ fontSize: 48, color: '#999' }} />
              <p style={{ marginTop: 8, color: '#666' }}>
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag and drop files here, or click to select files'}
              </p>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Images (JPEG, PNG, GIF, WebP) and documents (PDF, Word, Excel)
                up to {formatFileSize(MAX_FILE_SIZE)}
              </Text>
              {uploadFileMutation.isPending && (
                <p style={{ marginTop: 8, color: '#1677ff' }}>Uploading...</p>
              )}
            </div>
            {uploadErrors.length > 0 && (
              <Alert
                type="error"
                style={{ marginTop: 16 }}
                message={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {uploadErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
              />
            )}
          </Card>
        </PageSection>

        {/* File list */}
        <PageSection>
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
                <Input
                  placeholder="Search files..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ maxWidth: 300 }}
                  allowClear
                />
                {selectedCount > 0 && (
                  <Space>
                    <Text type="secondary">{selectedCount} selected</Text>
                    <Button
                      danger
                      size="small"
                      onClick={handleBulkDelete}
                      loading={deleteFileMutation.isPending}
                    >
                      Delete Selected
                    </Button>
                  </Space>
                )}
              </div>
            }
            emptyState={
              <EmptyState
                icon={<FileOutlined style={{ fontSize: 48, color: '#999' }} />}
                title="No files found"
                description="Upload files using the dropzone above."
              />
            }
          />

          {/* Error state */}
          {error && (
            <Alert
              type="error"
              style={{ marginTop: 16 }}
              message="Failed to load files. Please try again."
            />
          )}
        </PageSection>
      </PageContent>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
        title="Delete File"
        description={`Are you sure you want to delete ${fileToDelete?.originalName || fileToDelete?.filename}? This action cannot be undone.`}
        confirmText={deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteFileMutation.isPending}
      />
    </>
  );
}
