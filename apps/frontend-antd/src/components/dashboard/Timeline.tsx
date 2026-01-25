'use client';

import { type ReactNode } from 'react';
import { Timeline as AntTimeline, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: ReactNode;
  status?: 'success' | 'error' | 'warning' | 'info';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString();
}

const statusColors = {
  success: '#52c41a',
  error: '#f5222d',
  warning: '#faad14',
  info: '#1890ff',
};

const statusIcons = {
  success: <CheckCircleOutlined />,
  error: <CloseCircleOutlined />,
  warning: <ExclamationCircleOutlined />,
  info: <InfoCircleOutlined />,
};

export function Timeline({ items, className }: TimelineProps) {
  const timelineItems = items.map((item) => {
    const color = item.status ? statusColors[item.status] : undefined;
    const icon =
      item.icon || (item.status ? statusIcons[item.status] : undefined);

    return {
      key: item.id,
      color,
      dot: icon ? <span style={{ color }}>{icon}</span> : undefined,
      children: (
        <div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Text strong style={{ fontSize: 14 }}>
                {item.title}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </div>
            {item.description && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {item.description}
              </Text>
            )}
          </div>
        </div>
      ),
    };
  });

  return <AntTimeline className={className} items={timelineItems} />;
}
