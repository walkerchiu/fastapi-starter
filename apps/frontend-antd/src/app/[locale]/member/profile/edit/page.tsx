'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Form,
  Row,
  Col,
  Typography,
  Avatar,
  Upload,
  Flex,
  message,
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRouter } from '@/i18n/routing';

const { Text } = Typography;

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  location: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form] = Form.useForm<ProfileFormData>();
  const [isSaving, setIsSaving] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const initialValues: ProfileFormData = {
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session?.user?.email || '',
    phone: '',
    bio: '',
    website: '',
    location: '',
  };

  const handleSubmit = async (values: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Profile updated:', values);
      message.success('Profile updated successfully');
    } catch {
      message.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  const handleRemovePhoto = () => {
    setFileList([]);
    message.success('Photo removed');
  };

  return (
    <>
      <PageHeader
        title="Edit Profile"
        description="Update your personal information"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Profile', href: '/member/profile' },
          { label: 'Edit' },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/member/profile')}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Back to Profile
          </Button>
        }
      />
      <PageContent>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            {/* Main Form */}
            <Col xs={24} lg={16}>
              <PageSection title="Basic Information">
                <Card>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter your first name',
                          },
                        ]}
                      >
                        <Input placeholder="John" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter your last name',
                          },
                        ]}
                      >
                        <Input placeholder="Doe" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    label="Email Address"
                    extra="Email cannot be changed. Contact support if you need to update it."
                  >
                    <Input type="email" disabled />
                  </Form.Item>

                  <Form.Item name="phone" label="Phone Number">
                    <Input type="tel" placeholder="+1 (555) 000-0000" />
                  </Form.Item>
                </Card>
              </PageSection>

              <div style={{ marginTop: 24 }}>
                <PageSection title="Additional Information">
                  <Card>
                    <Form.Item
                      name="bio"
                      label="Bio"
                      extra="Brief description for your profile. Max 500 characters."
                    >
                      <Textarea
                        rows={4}
                        maxLength={500}
                        showCount
                        placeholder="Tell us about yourself..."
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="website"
                          label="Website"
                          rules={[
                            {
                              type: 'url',
                              message: 'Please enter a valid URL',
                            },
                          ]}
                        >
                          <Input type="url" placeholder="https://example.com" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="location" label="Location">
                          <Input placeholder="San Francisco, CA" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </PageSection>
              </div>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              <PageSection title="Profile Photo">
                <Card>
                  <Flex vertical align="center" gap={16}>
                    <Avatar
                      size={96}
                      icon={<UserOutlined />}
                      src={
                        (session?.user as { image?: string } | undefined)
                          ?.image || undefined
                      }
                      style={{
                        backgroundColor: (
                          session?.user as { image?: string } | undefined
                        )?.image
                          ? undefined
                          : '#1890ff',
                      }}
                    />
                    <Flex vertical gap={8} style={{ width: '100%' }}>
                      <Upload
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/png,image/jpeg,image/gif"
                        showUploadList={false}
                      >
                        <Button variant="outline" fullWidth>
                          <CameraOutlined style={{ marginRight: 8 }} />
                          Upload New Photo
                        </Button>
                      </Upload>
                      <Button
                        variant="ghost"
                        fullWidth
                        onClick={handleRemovePhoto}
                        disabled={
                          !(session?.user as { image?: string } | undefined)
                            ?.image && fileList.length === 0
                        }
                        style={{ color: '#ff4d4f' }}
                      >
                        <DeleteOutlined style={{ marginRight: 8 }} />
                        Remove Photo
                      </Button>
                    </Flex>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, textAlign: 'center' }}
                    >
                      JPG, PNG or GIF. Max size 2MB.
                    </Text>
                  </Flex>
                </Card>
              </PageSection>

              <div style={{ marginTop: 24 }}>
                <PageSection title="Account Status">
                  <Card>
                    <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                      <CheckCircleOutlined
                        style={{ color: '#52c41a', fontSize: 16 }}
                      />
                      <Text strong>Verified</Text>
                    </Flex>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Your email has been verified.
                    </Text>
                  </Card>
                </PageSection>
              </div>
            </Col>
          </Row>

          {/* Actions */}
          <Flex justify="flex-end" gap={12} style={{ marginTop: 24 }}>
            <Button
              variant="outline"
              onClick={() => router.push('/member/profile')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isSaving}
              onClick={() => form.submit()}
            >
              Save Changes
            </Button>
          </Flex>
        </Form>
      </PageContent>
    </>
  );
}
