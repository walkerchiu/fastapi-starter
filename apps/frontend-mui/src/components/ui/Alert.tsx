'use client';

import { type ReactNode } from 'react';
import MuiAlert from '@mui/material/Alert';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({
  variant = 'info',
  children,
  className = '',
}: AlertProps) {
  return (
    <MuiAlert severity={variant} className={className} sx={{ borderRadius: 1 }}>
      {children}
    </MuiAlert>
  );
}
