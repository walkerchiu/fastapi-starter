import { type ReactNode } from 'react';
import { Alert as AntAlert } from 'antd';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  closable = false,
  onClose,
  className,
}: AlertProps) {
  return (
    <AntAlert
      type={variant}
      message={title || children}
      description={title ? children : undefined}
      closable={closable}
      onClose={onClose}
      className={className}
      showIcon
    />
  );
}
