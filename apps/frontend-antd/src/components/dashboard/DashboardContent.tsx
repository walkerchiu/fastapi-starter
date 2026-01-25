import { type ReactNode } from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

export interface DashboardContentProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const paddingMap: Record<
  NonNullable<DashboardContentProps['padding']>,
  string
> = {
  none: '0',
  sm: '8px 16px',
  md: '16px 24px',
  lg: '24px 32px',
};

const maxWidthMap: Record<
  NonNullable<DashboardContentProps['maxWidth']>,
  string | number
> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  full: '100%',
};

export function DashboardContent({
  children,
  padding = 'md',
  maxWidth = 'full',
  className,
}: DashboardContentProps) {
  return (
    <Content
      className={className}
      style={{
        flex: 1,
        padding: paddingMap[padding],
      }}
    >
      <div
        style={{
          maxWidth: maxWidthMap[maxWidth],
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </Content>
  );
}
