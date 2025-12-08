import { type ReactNode } from 'react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; text: string }> =
  {
    error: {
      container: 'bg-red-50',
      text: 'text-red-700',
    },
    success: {
      container: 'bg-green-50',
      text: 'text-green-700',
    },
    warning: {
      container: 'bg-yellow-50',
      text: 'text-yellow-700',
    },
    info: {
      container: 'bg-blue-50',
      text: 'text-blue-700',
    },
  };

export function Alert({
  variant = 'info',
  children,
  className = '',
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-md p-4 ${styles.container} ${className}`.trim()}
      role="alert"
    >
      <p className={`text-sm ${styles.text}`}>{children}</p>
    </div>
  );
}
