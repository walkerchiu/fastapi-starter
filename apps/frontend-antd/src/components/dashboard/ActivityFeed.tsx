'use client';

import { type ReactNode } from 'react';
import { List, Skeleton, Typography } from 'antd';
import { Avatar } from '../ui/Avatar';

const { Text } = Typography;

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date | string;
  icon?: ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function ActivityFeed({
  items,
  loading = false,
  emptyText = 'No recent activity',
  className,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div className={className}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: 12,
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <Skeleton.Avatar active size={32} />
            <div style={{ flex: 1 }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: '75%', marginBottom: 4 }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 60, height: 12 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: '32px 0',
          textAlign: 'center',
        }}
      >
        <Text type="secondary">{emptyText}</Text>
      </div>
    );
  }

  return (
    <List
      className={className}
      dataSource={items}
      renderItem={(item) => (
        <List.Item style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <div style={{ flexShrink: 0 }}>
              {item.icon ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                  }}
                >
                  {item.icon}
                </div>
              ) : (
                <Avatar
                  src={item.user.avatar}
                  name={item.user.name}
                  size="sm"
                />
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text>
                <Text strong>{item.user.name}</Text>{' '}
                <Text type="secondary">{item.action}</Text>
                {item.target && (
                  <>
                    {' '}
                    <Text strong>{item.target}</Text>
                  </>
                )}
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatTimestamp(item.timestamp)}
                </Text>
              </div>
            </div>
          </div>
        </List.Item>
      )}
    />
  );
}
