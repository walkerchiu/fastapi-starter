'use client';

import { forwardRef } from 'react';

export type StatusBadgeStatus = 'active' | 'inactive' | 'pending' | 'error';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  size?: StatusBadgeSize;
  showDot?: boolean;
  label?: string;
  className?: string;
}

const statusStyles: Record<
  StatusBadgeStatus,
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  inactive: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
  pending: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

const sizeStyles: Record<
  StatusBadgeSize,
  { badge: string; dot: string; text: string }
> = {
  sm: {
    badge: 'px-2 py-0.5',
    dot: 'h-1.5 w-1.5',
    text: 'text-xs',
  },
  md: {
    badge: 'px-2.5 py-1',
    dot: 'h-2 w-2',
    text: 'text-sm',
  },
  lg: {
    badge: 'px-3 py-1.5',
    dot: 'h-2.5 w-2.5',
    text: 'text-base',
  },
};

const defaultLabels: Record<StatusBadgeStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  error: 'Error',
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = 'md', showDot = true, label, className = '' }, ref) => {
    const statusStyle = statusStyles[status];
    const sizeStyle = sizeStyles[size];
    const displayLabel = label ?? defaultLabels[status];

    const combinedClassName = [
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      statusStyle.bg,
      statusStyle.text,
      sizeStyle.badge,
      sizeStyle.text,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={combinedClassName}>
        {showDot && (
          <span
            className={`${sizeStyle.dot} ${statusStyle.dot} rounded-full flex-shrink-0`}
            aria-hidden="true"
          />
        )}
        {displayLabel}
      </span>
    );
  },
);

StatusBadge.displayName = 'StatusBadge';
