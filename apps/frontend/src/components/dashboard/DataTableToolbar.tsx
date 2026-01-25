'use client';

import { type ReactNode } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick: () => void;
}

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  selectedCount?: number;
  bulkActions?: BulkAction[];
  className?: string;
}

export function DataTableToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  selectedCount = 0,
  bulkActions = [],
  className = '',
}: DataTableToolbarProps) {
  const showBulkActions = selectedCount > 0 && bulkActions.length > 0;

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-1 items-center gap-4">
        {/* Search */}
        {onSearchChange && (
          <div className="w-full max-w-sm">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Selected count and bulk actions */}
        {showBulkActions && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} selected
            </span>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            {bulkActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon && <span className="mr-1.5">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
