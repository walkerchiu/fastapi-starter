import { type ReactNode } from 'react';
import Stack from '@mui/material/Stack';

export interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <Stack spacing={3} className={className}>
      {children}
    </Stack>
  );
}
