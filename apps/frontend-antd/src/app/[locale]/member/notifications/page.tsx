'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  List,
  Typography,
  Flex,
  Empty,
  Divider,
  Checkbox,
  Space,
  Modal,
  Avatar,
} from 'antd';
import {
  BellOutlined,
  ShoppingOutlined,
  GiftOutlined,
  MailOutlined,
  SafetyOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const { Text, Title } = Typography;
const { confirm } = Modal;

type NotificationType = 'order' | 'promo' | 'security' | 'system' | 'message';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD-2024-002 has been shipped and is on its way.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Flash Sale: 30% Off',
    message: 'Limited time offer! Get 30% off on all electronics this weekend.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'security',
    title: 'New Login Detected',
    message: 'A new login was detected from Chrome on Windows. Was this you?',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '4',
    type: 'order',
    title: 'Order Delivered',
    message:
      'Your order #ORD-2024-001 has been delivered. Enjoy your purchase!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '5',
    type: 'message',
    title: 'Support Reply',
    message:
      'Our support team has replied to your inquiry. Check your messages.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '7',
    type: 'promo',
    title: 'New Products Available',
    message: 'Check out our latest collection of summer essentials.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

const typeIcons: Record<NotificationType, React.ReactNode> = {
  order: <ShoppingOutlined />,
  promo: <GiftOutlined />,
  security: <SafetyOutlined />,
  system: <InfoCircleOutlined />,
  message: <MailOutlined />,
};

const typeColors: Record<NotificationType, string> = {
  order: '#1890ff',
  promo: '#fa541c',
  security: '#faad14',
  system: '#722ed1',
  message: '#52c41a',
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    return {
      total: notifications.length,
      unread,
      read: notifications.length - unread,
    };
  }, [notifications]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  const handleMarkAsRead = () => {
    if (selectedIds.size === 0) {
      // Mark all as read
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      // Mark selected as read
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n)),
      );
      setSelectedIds(new Set());
    }
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;

    confirm({
      title: 'Delete Selected Notifications?',
      icon: <ExclamationCircleOutlined />,
      content: `${selectedIds.size} notification(s) will be permanently deleted.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
      },
    });
  };

  const handleClickNotification = (notification: Notification) => {
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated with your latest activities"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Notifications' },
        ]}
        actions={
          stats.unread > 0 && (
            <Button variant="primary" onClick={handleMarkAsRead}>
              <CheckOutlined style={{ marginRight: 8 }} />
              Mark All as Read
            </Button>
          )
        }
      />
      <PageContent>
        <Flex gap={24} wrap="wrap">
          <div style={{ flex: '2 1 500px', minWidth: 0 }}>
            <PageSection title="All Notifications">
              <Card>
                {stats.unread > 0 && (
                  <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
                    <Text strong>All Notifications</Text>
                    <Badge variant="primary">{stats.unread} new</Badge>
                  </Flex>
                )}
                {notifications.length > 0 && (
                  <>
                    <Flex
                      justify="space-between"
                      align="center"
                      style={{ marginBottom: 16 }}
                    >
                      <Checkbox
                        checked={selectedIds.size === notifications.length}
                        indeterminate={
                          selectedIds.size > 0 &&
                          selectedIds.size < notifications.length
                        }
                        onChange={handleSelectAll}
                      >
                        Select All
                      </Checkbox>
                      {selectedIds.size > 0 && (
                        <Space>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAsRead}
                          >
                            <CheckOutlined style={{ marginRight: 4 }} />
                            Mark as Read
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                          >
                            <DeleteOutlined
                              style={{ marginRight: 4, color: '#ff4d4f' }}
                            />
                            Delete
                          </Button>
                        </Space>
                      )}
                    </Flex>
                    <Divider style={{ margin: '0 0 16px 0' }} />
                  </>
                )}

                {notifications.length === 0 ? (
                  <Empty
                    image={
                      <BellOutlined
                        style={{ fontSize: 64, color: '#d9d9d9' }}
                      />
                    }
                    description={
                      <div>
                        <Title level={5} style={{ marginBottom: 8 }}>
                          No notifications
                        </Title>
                        <Text type="secondary">
                          You're all caught up! Check back later.
                        </Text>
                      </div>
                    }
                  />
                ) : (
                  <List
                    dataSource={notifications}
                    renderItem={(notification) => (
                      <List.Item
                        style={{
                          backgroundColor: notification.read
                            ? 'transparent'
                            : '#f6ffed',
                          padding: '12px 16px',
                          marginBottom: 8,
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleClickNotification(notification)}
                      >
                        <Flex
                          align="flex-start"
                          gap={12}
                          style={{ width: '100%' }}
                        >
                          <Checkbox
                            checked={selectedIds.has(notification.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleSelect(notification.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Avatar
                            style={{
                              backgroundColor: typeColors[notification.type],
                              flexShrink: 0,
                            }}
                            icon={typeIcons[notification.type]}
                          />
                          <Flex
                            vertical
                            gap={4}
                            style={{ flex: 1, minWidth: 0 }}
                          >
                            <Flex
                              justify="space-between"
                              align="center"
                              wrap="wrap"
                              gap={8}
                            >
                              <Text
                                strong={!notification.read}
                                style={{ fontSize: 14 }}
                              >
                                {notification.title}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: 12, flexShrink: 0 }}
                              >
                                {formatRelativeTime(notification.timestamp)}
                              </Text>
                            </Flex>
                            <Text
                              type="secondary"
                              ellipsis={{ tooltip: notification.message }}
                              style={{ fontSize: 13 }}
                            >
                              {notification.message}
                            </Text>
                          </Flex>
                          {!notification.read && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#1890ff',
                                flexShrink: 0,
                                marginTop: 6,
                              }}
                            />
                          )}
                        </Flex>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </PageSection>
          </div>

          <div style={{ flex: '1 1 280px', minWidth: 280 }}>
            <PageSection title="Summary">
              <Card>
                <Flex vertical gap={16}>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">Total</Text>
                    <Badge variant="default">{stats.total}</Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">Unread</Text>
                    <Badge variant="primary">{stats.unread}</Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">Read</Text>
                    <Badge variant="secondary">{stats.read}</Badge>
                  </Flex>
                </Flex>
              </Card>
            </PageSection>

            <div style={{ marginTop: 24 }}>
              <PageSection title="Notification Types">
                <Card>
                  <Flex vertical gap={12}>
                    {(
                      Object.entries(typeIcons) as [
                        NotificationType,
                        React.ReactNode,
                      ][]
                    ).map(([type, icon]) => {
                      const count = notifications.filter(
                        (n) => n.type === type,
                      ).length;
                      return (
                        <Flex key={type} justify="space-between" align="center">
                          <Flex align="center" gap={8}>
                            <Avatar
                              size="small"
                              style={{
                                backgroundColor: typeColors[type],
                              }}
                              icon={icon}
                            />
                            <Text style={{ textTransform: 'capitalize' }}>
                              {type}
                            </Text>
                          </Flex>
                          <Text type="secondary">{count}</Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                </Card>
              </PageSection>
            </div>
          </div>
        </Flex>
      </PageContent>
    </>
  );
}
