import { type ReactNode } from 'react';
import { Tag } from 'antd';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const colorMap: Record<BadgeVariant, string> = {
  default: 'default',
  primary: 'blue',
  secondary: 'default',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

export function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <Tag color={colorMap[variant]} className={className}>
      {children}
    </Tag>
  );
}
