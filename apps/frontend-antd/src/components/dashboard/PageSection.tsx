'use client';

import { useState, type ReactNode } from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: PageSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const hasHeader = title || description || actions;

  const headerTitle = hasHeader ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {collapsible && (
        <Button
          type="text"
          size="small"
          icon={collapsed ? <RightOutlined /> : <DownOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand section' : 'Collapse section'}
        />
      )}
      <div>
        {title && (
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
        )}
        {description && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {description}
          </Text>
        )}
      </div>
    </div>
  ) : undefined;

  return (
    <Card
      className={className}
      title={headerTitle}
      extra={actions && <Space>{actions}</Space>}
      styles={{
        body: {
          display: collapsible && collapsed ? 'none' : undefined,
        },
      }}
    >
      {children}
    </Card>
  );
}
