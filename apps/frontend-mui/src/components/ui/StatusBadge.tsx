'use client';

import { forwardRef } from 'react';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

export type StatusBadgeStatus = 'active' | 'inactive' | 'pending' | 'error';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  size?: StatusBadgeSize;
  showDot?: boolean;
  label?: string;
  className?: string;
}

const statusColors: Record<
  StatusBadgeStatus,
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: '#dcfce7',
    text: '#15803d',
    dot: '#22c55e',
  },
  inactive: {
    bg: '#f3f4f6',
    text: '#374151',
    dot: '#6b7280',
  },
  pending: {
    bg: '#fef9c3',
    text: '#a16207',
    dot: '#eab308',
  },
  error: {
    bg: '#fee2e2',
    text: '#b91c1c',
    dot: '#ef4444',
  },
};

const sizeMap: Record<StatusBadgeSize, 'small' | 'medium'> = {
  sm: 'small',
  md: 'medium',
  lg: 'medium',
};

const dotSizeMap: Record<StatusBadgeSize, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

const defaultLabels: Record<StatusBadgeStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  error: 'Error',
};

export const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, size = 'md', showDot = true, label, className }, ref) => {
    const colors = statusColors[status];
    const displayLabel = label ?? defaultLabels[status];
    const dotSize = dotSizeMap[size];

    return (
      <Chip
        ref={ref}
        size={sizeMap[size]}
        className={className}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {showDot && (
              <Box
                sx={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  backgroundColor: colors.dot,
                  flexShrink: 0,
                }}
              />
            )}
            {displayLabel}
          </Box>
        }
        sx={{
          backgroundColor: colors.bg,
          color: colors.text,
          fontWeight: 500,
          height: size === 'lg' ? 32 : undefined,
          fontSize: size === 'lg' ? '0.875rem' : undefined,
          '& .MuiChip-label': {
            px: size === 'sm' ? 1 : 1.5,
          },
        }}
      />
    );
  },
);

StatusBadge.displayName = 'StatusBadge';
