'use client';

import { type ReactNode } from 'react';
import { Empty, Typography, Space } from 'antd';

const { Text, Title } = Typography;

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{ padding: '48px 16px', textAlign: 'center' }}
    >
      <Empty image={icon || Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
        <Space direction="vertical" size={4}>
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          {description && (
            <Text
              type="secondary"
              style={{ maxWidth: 384, display: 'inline-block' }}
            >
              {description}
            </Text>
          )}
          {action && <div style={{ marginTop: 16 }}>{action}</div>}
        </Space>
      </Empty>
    </div>
  );
}
