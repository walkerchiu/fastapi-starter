'use client';

import { forwardRef } from 'react';
import { Tag } from 'antd';

export type StatusBadgeStatus = 'active' | 'inactive' | 'pending' | 'error';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  size?: StatusBadgeSize;
  showDot?: boolean;
  label?: string;
  className?: string;
}

const statusColors: Record<StatusBadgeStatus, string> = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  error: 'error',
};

const dotColors: Record<StatusBadgeStatus, string> = {
  active: '#52c41a',
  inactive: '#8c8c8c',
  pending: '#faad14',
  error: '#ff4d4f',
};

const sizeStyles: Record<StatusBadgeSize, React.CSSProperties> = {
  sm: {
    fontSize: '12px',
    padding: '0 6px',
    lineHeight: '18px',
  },
  md: {
    fontSize: '14px',
    padding: '2px 10px',
    lineHeight: '22px',
  },
  lg: {
    fontSize: '16px',
    padding: '4px 12px',
    lineHeight: '26px',
  },
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

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = 'md', showDot = true, label, className }, ref) => {
    const displayLabel = label ?? defaultLabels[status];
    const dotSize = dotSizeMap[size];

    return (
      <Tag
        ref={ref}
        color={statusColors[status]}
        className={className}
        style={{
          ...sizeStyles[size],
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: '9999px',
          margin: 0,
        }}
      >
        {showDot && (
          <span
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: dotColors[status],
              flexShrink: 0,
            }}
          />
        )}
        {displayLabel}
      </Tag>
    );
  },
);

StatusBadge.displayName = 'StatusBadge';
