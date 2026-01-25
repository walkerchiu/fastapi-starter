'use client';

import { type ReactNode } from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        {description && (
          <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
            {description}
          </Text>
        )}
      </div>
      <Card>{children}</Card>
    </div>
  );
}
