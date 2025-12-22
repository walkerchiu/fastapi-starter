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
      container: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
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
