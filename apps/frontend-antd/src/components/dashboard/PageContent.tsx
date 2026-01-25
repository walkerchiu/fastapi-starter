import { type ReactNode } from 'react';
import { Space } from 'antd';

export interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <Space
      direction="vertical"
      size="large"
      className={className}
      style={{ width: '100%' }}
    >
      {children}
    </Space>
  );
}
