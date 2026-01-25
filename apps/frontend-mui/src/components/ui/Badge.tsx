'use client';

import { type ReactNode } from 'react';
import Chip from '@mui/material/Chip';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantColorMap: Record<
  BadgeVariant,
  'success' | 'error' | 'warning' | 'info' | 'default'
> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  neutral: 'default',
};

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: BadgeProps) {
  return (
    <Chip
      label={children}
      color={variantColorMap[variant]}
      size="small"
      className={className}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  );
}
