'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import {
  PageHeader,
  PageContent,
  PageSection,
  ConfirmDialog,
  FormSection,
} from '@/components/dashboard';
import { FormField } from '@/components/ui';
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
  useEffect(() => {
    if (file) {
      reset({
        filename: file.originalName || file.filename,
        description: file.description ?? undefined,
      });
    }
  }, [file, reset]);

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
      return { color: 'success' as const, label: 'Image', canPreview: true };
    }
    if (mimeType === 'application/pdf') {
      return { color: 'error' as const, label: 'PDF', canPreview: true };
    }
    if (mimeType?.includes('word') || mimeType?.includes('document')) {
      return { color: 'info' as const, label: 'Document', canPreview: false };
    }
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
      return {
        color: 'warning' as const,
        label: 'Spreadsheet',
        canPreview: false,
      };
    }
    return { color: 'default' as const, label: 'File', canPreview: false };
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
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                The file you are looking for could not be found.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/admin/files')}
              >
                Back to Files
              </Button>
            </Paper>
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
            <Stack direction="row" spacing={1}>
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
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
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => window.open(file?.url, '_blank')}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </>
              )}
            </Stack>
          )
        }
      />
      <PageContent>
        <Grid container spacing={3}>
          {/* Preview */}
          <Grid item xs={12} lg={8}>
            <PageSection>
              <FormSection title="Preview">
                {isLoading ? (
                  <Skeleton variant="rounded" height={384} />
                ) : fileTypeInfo.canPreview ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    {file?.mimeType?.startsWith('image/') ? (
                      <Box
                        component="img"
                        src={file?.url}
                        alt={file?.originalName || file?.filename}
                        sx={{
                          maxHeight: 384,
                          borderRadius: 1,
                          objectFit: 'contain',
                        }}
                      />
                    ) : file?.mimeType === 'application/pdf' ? (
                      <Box
                        component="iframe"
                        src={file?.url}
                        title={file?.originalName || file?.filename}
                        sx={{
                          width: '100%',
                          height: 384,
                          borderRadius: 1,
                          border: 'none',
                        }}
                      />
                    ) : null}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      py: 8,
                    }}
                  >
                    <InsertDriveFileIcon
                      sx={{ fontSize: 64, color: 'text.secondary' }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Preview not available for this file type
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => window.open(file?.url, '_blank')}
                    >
                      Download to View
                    </Button>
                  </Box>
                )}
              </FormSection>
            </PageSection>

            {/* Metadata edit form */}
            <PageSection>
              <FormSection
                title="File Information"
                description="Edit file display name and description"
              >
                {isLoading ? (
                  <Stack spacing={3}>
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={96} />
                  </Stack>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                      <FormField
                        label="Display Name"
                        error={errors.filename?.message}
                      >
                        {(props) => (
                          <TextField
                            {...props}
                            {...register('filename')}
                            fullWidth
                            disabled={!isEditing}
                            placeholder="Enter display name"
                            error={!!errors.filename}
                          />
                        )}
                      </FormField>

                      <FormField
                        label="Description"
                        error={errors.description?.message}
                      >
                        {(props) => (
                          <TextField
                            {...props}
                            {...register('description')}
                            fullWidth
                            multiline
                            rows={3}
                            disabled={!isEditing}
                            placeholder="Enter file description"
                            error={!!errors.description}
                          />
                        )}
                      </FormField>
                    </Stack>
                  </form>
                )}
              </FormSection>
            </PageSection>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <PageSection>
                <FormSection title="File Details">
                  {isLoading ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rounded" height={24} />
                      <Skeleton variant="rounded" height={24} />
                      <Skeleton variant="rounded" height={24} />
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Type
                        </Typography>
                        <Chip
                          label={fileTypeInfo.label}
                          color={fileTypeInfo.color}
                          size="small"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Size
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatFileSize(file?.size || 0)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          MIME Type
                        </Typography>
                        <Typography variant="body2">
                          {file?.mimeType}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Uploaded
                        </Typography>
                        <Typography variant="body2">
                          {file?.createdAt
                            ? new Date(file.createdAt).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Updated
                        </Typography>
                        <Typography variant="body2">
                          {file?.updatedAt
                            ? new Date(file.updatedAt).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          File Path
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            display: 'block',
                            wordBreak: 'break-all',
                          }}
                        >
                          {file?.filename}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </FormSection>
              </PageSection>

              <PageSection>
                <FormSection title="Actions">
                  <Stack spacing={1.5}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() => window.open(file?.url, '_blank')}
                      disabled={isLoading}
                    >
                      Download File
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ContentCopyIcon />}
                      onClick={() => {
                        navigator.clipboard.writeText(file?.url || '');
                      }}
                      disabled={isLoading}
                    >
                      Copy URL
                    </Button>
                  </Stack>
                </FormSection>
              </PageSection>
            </Stack>
          </Grid>
        </Grid>
      </PageContent>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete File"
        description={`Are you sure you want to delete ${file?.originalName || file?.filename}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteFileMutation.isPending}
      />
    </>
  );
}
