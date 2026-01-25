'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  PageHeader,
  PageContent,
  PageSection,
  DataTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@/components/dashboard';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
} from '@/components/ui';
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
        total: data.meta?.totalItems || data.data.length,
      }));
      return data.data as FileItem[];
    }
    return [];
  }, [data]);

  // Get file type badge variant
  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return { variant: 'success' as const, label: 'Image' };
    }
    if (mimeType === 'application/pdf') {
      return { variant: 'error' as const, label: 'PDF' };
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return { variant: 'info' as const, label: 'Document' };
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return { variant: 'warning' as const, label: 'Spreadsheet' };
    }
    return { variant: 'neutral' as const, label: 'File' };
  };

  // Table columns
  const columns: ColumnDef<FileItem>[] = useMemo(
    () => [
      {
        key: 'filename',
        header: 'File',
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-3">
            {row.thumbnailUrl ? (
              <img
                src={row.thumbnailUrl}
                alt={row.filename}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {row.originalName || row.filename}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {row.filename}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'mimeType',
        header: 'Type',
        cell: (row) => {
          const badge = getFileTypeBadge(row.mimeType);
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        },
      },
      {
        key: 'size',
        header: 'Size',
        sortable: true,
        cell: (row) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatFileSize(row.size)}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Uploaded',
        sortable: true,
        cell: (row) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        cell: (row) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.url, '_blank');
              }}
            >
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/files/${row.id}`);
              }}
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFileToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
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
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Upload Files
              </h3>
            </CardHeader>
            <CardBody>
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                }`}
              >
                <input {...getInputProps()} />
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag and drop files here, or click to select files'}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Images (JPEG, PNG, GIF, WebP) and documents (PDF, Word, Excel)
                  up to {formatFileSize(MAX_FILE_SIZE)}
                </p>
                {uploadFileMutation.isPending && (
                  <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
                    Uploading...
                  </p>
                )}
              </div>
              {uploadErrors.length > 0 && (
                <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <ul className="list-inside list-disc text-sm text-red-700 dark:text-red-300">
                    {uploadErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        </PageSection>

        {/* File list */}
        <PageSection>
          <Card>
            <CardBody>
              {/* Toolbar */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <Input
                    type="search"
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                {selectedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedCount} selected
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={deleteFileMutation.isPending}
                    >
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>

              {/* Error state */}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Failed to load files. Please try again.
                  </p>
                </div>
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
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No files found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload files using the dropzone above.
                    </p>
                  </div>
                }
              />
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        title="Delete File"
        size="sm"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {fileToDelete?.originalName || fileToDelete?.filename}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setFileToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteFile}
            disabled={deleteFileMutation.isPending}
          >
            {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
