'use client';

import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import {
  PageHeader,
  PageContent,
  PageSection,
  EmptyState,
} from '@/components/dashboard';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'account';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD-2024-001 has been delivered successfully.',
    date: '2024-01-23T14:30:00Z',
    read: false,
    actionUrl: '/member/orders/1',
    actionLabel: 'View Order',
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Flash Sale!',
    message: 'Get 30% off on all electronics. Limited time offer!',
    date: '2024-01-22T10:00:00Z',
    read: false,
    actionUrl: '/products?category=electronics',
    actionLabel: 'Shop Now',
  },
  {
    id: '3',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD-2024-002 has been shipped. Track your package.',
    date: '2024-01-21T09:00:00Z',
    read: true,
    actionUrl: '/member/orders/2',
    actionLabel: 'Track Order',
  },
  {
    id: '4',
    type: 'account',
    title: 'Password Changed',
    message:
      'Your password was changed successfully. If you did not make this change, please contact support.',
    date: '2024-01-20T15:00:00Z',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    message:
      'Scheduled maintenance will occur on January 25th, 2024 from 2:00 AM to 4:00 AM UTC.',
    date: '2024-01-19T12:00:00Z',
    read: true,
  },
  {
    id: '6',
    type: 'promotion',
    title: 'New Arrivals',
    message: 'Check out our latest collection of spring products!',
    date: '2024-01-18T08:00:00Z',
    read: true,
    actionUrl: '/products?sort=newest',
    actionLabel: 'Explore',
  },
];

const typeConfig = {
  order: {
    label: 'Order',
    color: 'info' as const,
    icon: <ReceiptLongIcon />,
    bgColor: 'info.light',
    textColor: 'info.dark',
  },
  promotion: {
    label: 'Promotion',
    color: 'success' as const,
    icon: <CardGiftcardIcon />,
    bgColor: 'success.light',
    textColor: 'success.dark',
  },
  system: {
    label: 'System',
    color: 'warning' as const,
    icon: <SettingsIcon />,
    bgColor: 'warning.light',
    textColor: 'warning.dark',
  },
  account: {
    label: 'Account',
    color: 'default' as const,
    icon: <PersonIcon />,
    bgColor: 'grey.200',
    textColor: 'grey.700',
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.read,
  );

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteSelected = () => {
    setNotifications(notifications.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Notifications' },
        ]}
        actions={
          unreadCount > 0 ? (
            <Button variant="outlined" onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          ) : undefined
        }
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardContent>
              {/* Toolbar */}
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox
                    checked={
                      selectedIds.length === filteredNotifications.length &&
                      filteredNotifications.length > 0
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < filteredNotifications.length
                    }
                    onChange={handleSelectAll}
                  />
                  {selectedIds.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={handleDeleteSelected}
                    >
                      Delete Selected ({selectedIds.length})
                    </Button>
                  )}
                </Box>
                <ToggleButtonGroup
                  value={filter}
                  exclusive
                  onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
                  size="small"
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="unread">
                    Unread ({unreadCount})
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Notification List */}
              {filteredNotifications.length > 0 ? (
                <Box>
                  {filteredNotifications.map((notification, index) => (
                    <Box key={notification.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          py: 2,
                          px: 1,
                          bgcolor: !notification.read
                            ? 'action.hover'
                            : 'transparent',
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Checkbox
                          checked={selectedIds.includes(notification.id)}
                          onChange={() => handleSelect(notification.id)}
                          onClick={(e) => e.stopPropagation()}
                        />

                        <Avatar
                          sx={{
                            bgcolor: typeConfig[notification.type].bgColor,
                            color: typeConfig[notification.type].textColor,
                          }}
                        >
                          {typeConfig[notification.type].icon}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={
                                    notification.read ? 'normal' : 'bold'
                                  }
                                >
                                  {notification.title}
                                </Typography>
                                {!notification.read && (
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: 'primary.main',
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {notification.message}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  mt: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  {formatDate(notification.date)}
                                </Typography>
                                <Chip
                                  label={typeConfig[notification.type].label}
                                  color={typeConfig[notification.type].color}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          </Box>

                          {/* Actions */}
                          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                            {notification.actionUrl && (
                              <Button
                                size="small"
                                variant="outlined"
                                href={notification.actionUrl}
                              >
                                {notification.actionLabel || 'View'}
                              </Button>
                            )}
                            <Button
                              size="small"
                              onClick={() => handleToggleRead(notification.id)}
                            >
                              {notification.read
                                ? 'Mark as Unread'
                                : 'Mark as Read'}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                      {index < filteredNotifications.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <EmptyState
                  icon={<NotificationsNoneIcon />}
                  title="No notifications"
                  description={
                    filter === 'unread'
                      ? "You're all caught up!"
                      : 'You have no notifications yet.'
                  }
                />
              )}
            </CardContent>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
