import { type ReactNode } from 'react';

export interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className = '' }: PageContentProps) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}
