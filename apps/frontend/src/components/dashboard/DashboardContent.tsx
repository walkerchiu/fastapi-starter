import { type ReactNode } from 'react';

export interface DashboardContentProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const paddingStyles: Record<
  NonNullable<DashboardContentProps['padding']>,
  string
> = {
  none: '',
  sm: 'p-2 md:p-4',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};

const maxWidthStyles: Record<
  NonNullable<DashboardContentProps['maxWidth']>,
  string
> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function DashboardContent({
  children,
  padding = 'md',
  maxWidth = 'full',
  className = '',
}: DashboardContentProps) {
  return (
    <main className={`flex-1 ${paddingStyles[padding]} ${className}`}>
      <div className={`mx-auto ${maxWidthStyles[maxWidth]}`}>{children}</div>
    </main>
  );
}
