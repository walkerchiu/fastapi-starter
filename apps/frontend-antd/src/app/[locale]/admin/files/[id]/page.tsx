'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  Input,
  Space,
  Tag,
  Typography,
  Skeleton,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  FileOutlined,
  CloseOutlined,
  SaveOutlined,
} from '@ant-design/icons';

import {
  PageHeader,
  PageContent,
  PageSection,
  ConfirmDialog,
} from '@/components/dashboard';
import { useFile, useUpdateFile, useDeleteFile } from '@/hooks/api';
import {
  updateFileMetadataSchema,
  type UpdateFileMetadataInput,
  formatFileSize,
} from '@/lib/validations';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

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
    control,
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
      return { color: 'success', label: 'Image', canPreview: true };
    }
    if (mimeType === 'application/pdf') {
      return { color: 'error', label: 'PDF', canPreview: true };
    }
    if (mimeType?.includes('word') || mimeType?.includes('document')) {
      return { color: 'processing', label: 'Document', canPreview: false };
    }
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
      return { color: 'warning', label: 'Spreadsheet', canPreview: false };
    }
    return { color: 'default', label: 'File', canPreview: false };
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
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Text type="secondary">
                  The file you are looking for could not be found.
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => router.push('/admin/files')}
                  >
                    Back to Files
                  </Button>
                </div>
              </div>
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
            <Space>
              {isEditing ? (
                <>
                  <Button icon={<CloseOutlined />} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isDirty}
                    loading={updateFileMutation.isPending}
                  >
                    {updateFileMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(file?.url, '_blank')}
                  >
                    Download
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </>
              )}
            </Space>
          )
        }
      />
      <PageContent>
        <Row gutter={24}>
          {/* Preview */}
          <Col xs={24} lg={16}>
            <PageSection>
              <Card
                title={
                  <Title level={5} style={{ margin: 0 }}>
                    Preview
                  </Title>
                }
              >
                {isLoading ? (
                  <Skeleton.Image
                    active
                    style={{ width: '100%', height: 384 }}
                  />
                ) : fileTypeInfo.canPreview ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      borderRadius: 8,
                      padding: 16,
                      minHeight: 384,
                    }}
                  >
                    {file?.mimeType?.startsWith('image/') ? (
                      <img
                        src={file?.url}
                        alt={file?.originalName || file?.filename}
                        style={{
                          maxHeight: 384,
                          borderRadius: 8,
                          objectFit: 'contain',
                        }}
                      />
                    ) : file?.mimeType === 'application/pdf' ? (
                      <iframe
                        src={file?.url}
                        style={{
                          width: '100%',
                          height: 384,
                          borderRadius: 8,
                          border: 'none',
                        }}
                        title={file?.originalName || file?.filename}
                      />
                    ) : null}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      borderRadius: 8,
                      padding: 64,
                    }}
                  >
                    <FileOutlined style={{ fontSize: 64, color: '#999' }} />
                    <Text type="secondary" style={{ marginTop: 16 }}>
                      Preview not available for this file type
                    </Text>
                    <Button
                      type="primary"
                      style={{ marginTop: 16 }}
                      onClick={() => window.open(file?.url, '_blank')}
                    >
                      Download to View
                    </Button>
                  </div>
                )}
              </Card>
            </PageSection>

            {/* Metadata edit form */}
            <PageSection>
              <Card
                title={
                  <Title level={5} style={{ margin: 0 }}>
                    File Information
                  </Title>
                }
              >
                {isLoading ? (
                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <Skeleton active paragraph={{ rows: 1 }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </Space>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <div>
                        <Text
                          strong
                          style={{ display: 'block', marginBottom: 8 }}
                        >
                          Display Name
                        </Text>
                        <Controller
                          name="filename"
                          control={control}
                          defaultValue={
                            file?.originalName || file?.filename || ''
                          }
                          render={({ field }) => (
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Enter display name"
                              status={errors.filename ? 'error' : undefined}
                            />
                          )}
                        />
                        {errors.filename && (
                          <Text type="danger" style={{ fontSize: 12 }}>
                            {errors.filename.message}
                          </Text>
                        )}
                      </div>

                      <div>
                        <Text
                          strong
                          style={{ display: 'block', marginBottom: 8 }}
                        >
                          Description
                        </Text>
                        <Controller
                          name="description"
                          control={control}
                          defaultValue={file?.description || ''}
                          render={({ field }) => (
                            <TextArea
                              {...field}
                              disabled={!isEditing}
                              placeholder="Enter file description"
                              rows={3}
                              status={errors.description ? 'error' : undefined}
                            />
                          )}
                        />
                        {errors.description && (
                          <Text type="danger" style={{ fontSize: 12 }}>
                            {errors.description.message}
                          </Text>
                        )}
                      </div>
                    </Space>
                  </form>
                )}
              </Card>
            </PageSection>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <PageSection>
              <Card
                title={
                  <Title level={5} style={{ margin: 0 }}>
                    File Details
                  </Title>
                }
              >
                {isLoading ? (
                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <Skeleton active paragraph={{ rows: 1 }} />
                    <Skeleton active paragraph={{ rows: 1 }} />
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Space>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text type="secondary">Type</Text>
                      <Tag color={fileTypeInfo.color}>{fileTypeInfo.label}</Tag>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text type="secondary">Size</Text>
                      <Text strong>{formatFileSize(file?.size || 0)}</Text>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text type="secondary">MIME Type</Text>
                      <Text>{file?.mimeType}</Text>
                    </div>
                    <Divider style={{ margin: '16px 0' }} />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text type="secondary">Uploaded</Text>
                      <Text>
                        {file?.createdAt
                          ? new Date(file.createdAt).toLocaleDateString()
                          : '-'}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text type="secondary">Updated</Text>
                      <Text>
                        {file?.updatedAt
                          ? new Date(file.updatedAt).toLocaleDateString()
                          : '-'}
                      </Text>
                    </div>
                    <Divider style={{ margin: '16px 0' }} />
                    <div>
                      <Text
                        type="secondary"
                        style={{ display: 'block', marginBottom: 4 }}
                      >
                        File Path
                      </Text>
                      <Paragraph
                        copyable
                        style={{
                          fontSize: 12,
                          margin: 0,
                          wordBreak: 'break-all',
                        }}
                      >
                        {file?.filename}
                      </Paragraph>
                    </div>
                  </Space>
                )}
              </Card>
            </PageSection>

            <PageSection>
              <Card
                title={
                  <Title level={5} style={{ margin: 0 }}>
                    Actions
                  </Title>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    block
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(file?.url, '_blank')}
                    disabled={isLoading}
                  >
                    Download File
                  </Button>
                  <Button
                    block
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(file?.url || '');
                    }}
                    disabled={isLoading}
                  >
                    Copy URL
                  </Button>
                </Space>
              </Card>
            </PageSection>
          </Col>
        </Row>
      </PageContent>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete File"
        description={`Are you sure you want to delete ${file?.originalName || file?.filename}? This action cannot be undone.`}
        confirmText={deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
        variant="danger"
        loading={deleteFileMutation.isPending}
      />
    </>
  );
}
