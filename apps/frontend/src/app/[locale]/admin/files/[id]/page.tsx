'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  Input,
  Modal,
  Skeleton,
} from '@/components/ui';
import { useFile, useUpdateFile, useDeleteFile } from '@/hooks/api';
import {
  updateFileMetadataSchema,
  type UpdateFileMetadataInput,
  formatFileSize,
} from '@/lib/validations';

export default function FileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params['id'] as string;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: file, isLoading, error } = useFile(fileId);
  const updateFileMutation = useUpdateFile();
  const deleteFileMutation = useDeleteFile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateFileMetadataInput>({
    resolver: zodResolver(updateFileMetadataSchema),
  });

  // Reset form when file data is loaded
  useState(() => {
    if (file) {
      reset({
        filename: file.originalName || file.filename,
        description: file.description ?? undefined,
      });
    }
  });

  const onSubmit = async (data: UpdateFileMetadataInput) => {
    try {
      await updateFileMutation.mutateAsync({ id: fileId, data });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update file:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFileMutation.mutateAsync(fileId);
      router.push('/admin/files');
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const handleCancel = () => {
    reset({
      filename: file?.originalName || file?.filename,
      description: file?.description ?? undefined,
    });
    setIsEditing(false);
  };

  // Get file type info
  const getFileTypeInfo = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return { variant: 'success' as const, label: 'Image', canPreview: true };
    }
    if (mimeType === 'application/pdf') {
      return { variant: 'error' as const, label: 'PDF', canPreview: true };
    }
    if (mimeType?.includes('word') || mimeType?.includes('document')) {
      return { variant: 'info' as const, label: 'Document', canPreview: false };
    }
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
      return {
        variant: 'warning' as const,
        label: 'Spreadsheet',
        canPreview: false,
      };
    }
    return { variant: 'neutral' as const, label: 'File', canPreview: false };
  };

  const fileTypeInfo = getFileTypeInfo(file?.mimeType || '');

  if (error) {
    return (
      <>
        <PageHeader
          title="File Not Found"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Files', href: '/admin/files' },
            { label: 'Not Found' },
          ]}
        />
        <PageContent>
          <PageSection>
            <Card>
              <CardBody>
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    The file you are looking for could not be found.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => router.push('/admin/files')}
                  >
                    Back to Files
                  </Button>
                </div>
              </CardBody>
            </Card>
          </PageSection>
        </PageContent>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={
          isLoading
            ? 'Loading...'
            : file?.originalName || file?.filename || 'File Details'
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Files', href: '/admin/files' },
          { label: isLoading ? '...' : file?.originalName || 'Details' },
        ]}
        actions={
          !isLoading && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isDirty || updateFileMutation.isPending}
                  >
                    {updateFileMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => window.open(file?.url, '_blank')}
                  >
                    Download
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </>
              )}
            </div>
          )
        }
      />
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Preview */}
          <div className="lg:col-span-2">
            <PageSection>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Preview
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <Skeleton className="h-96 w-full" />
                  ) : fileTypeInfo.canPreview ? (
                    <div className="flex items-center justify-center rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                      {file?.mimeType?.startsWith('image/') ? (
                        <img
                          src={file?.url}
                          alt={file?.originalName || file?.filename}
                          className="max-h-96 rounded object-contain"
                        />
                      ) : file?.mimeType === 'application/pdf' ? (
                        <iframe
                          src={file?.url}
                          className="h-96 w-full rounded"
                          title={file?.originalName || file?.filename}
                        />
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 py-16 dark:bg-gray-800">
                      <svg
                        className="h-16 w-16 text-gray-400"
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
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Preview not available for this file type
                      </p>
                      <Button
                        variant="primary"
                        className="mt-4"
                        onClick={() => window.open(file?.url, '_blank')}
                      >
                        Download to View
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </PageSection>

            {/* Metadata edit form */}
            <PageSection>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    File Information
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        label="Display Name"
                        error={errors.filename?.message}
                      >
                        {(props) => (
                          <Input
                            {...props}
                            {...register('filename')}
                            disabled={!isEditing}
                            placeholder="Enter display name"
                          />
                        )}
                      </FormField>

                      <FormField
                        label="Description"
                        error={errors.description?.message}
                      >
                        {(props) => (
                          <textarea
                            {...props}
                            {...register('description')}
                            disabled={!isEditing}
                            placeholder="Enter file description"
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-800 sm:text-sm"
                          />
                        )}
                      </FormField>
                    </form>
                  )}
                </CardBody>
              </Card>
            </PageSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PageSection>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    File Details
                  </h3>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Type
                        </span>
                        <Badge variant={fileTypeInfo.variant}>
                          {fileTypeInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Size
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatFileSize(file?.size || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          MIME Type
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {file?.mimeType}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Uploaded
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {file?.createdAt
                              ? new Date(file.createdAt).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Updated
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {file?.updatedAt
                              ? new Date(file.updatedAt).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          File Path
                        </span>
                        <p className="mt-1 break-all text-xs text-gray-900 dark:text-gray-100">
                          {file?.filename}
                        </p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </PageSection>

            <PageSection>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Actions
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => window.open(file?.url, '_blank')}
                      disabled={isLoading}
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download File
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(file?.url || '');
                      }}
                      disabled={isLoading}
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      Copy URL
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </PageSection>
          </div>
        </div>
      </PageContent>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete File"
        size="sm"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {file?.originalName || file?.filename}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteFileMutation.isPending}
          >
            {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
