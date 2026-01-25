import { type ReactNode } from 'react';

export interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  className?: string;
}

export function FormActions({
  children,
  align = 'right',
  sticky = false,
  className = '',
}: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={`
        flex items-center gap-3 border-t border-gray-200 pt-6 dark:border-gray-700
        ${alignmentClasses[align]}
        ${sticky ? 'sticky bottom-0 bg-white py-4 dark:bg-gray-900' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
