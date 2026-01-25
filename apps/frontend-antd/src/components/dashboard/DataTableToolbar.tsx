'use client';

import { type ReactNode } from 'react';
import { Space, Divider, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const { Text } = Typography;

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
  className,
}: DataTableToolbarProps) {
  const showBulkActions = selectedCount > 0 && bulkActions.length > 0;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <Space size={16} wrap>
        {/* Search */}
        {onSearchChange && (
          <div style={{ width: '100%', maxWidth: 320 }}>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              prefix={<SearchOutlined style={{ color: '#999' }} />}
            />
          </div>
        )}

        {/* Selected count and bulk actions */}
        {showBulkActions && (
          <Space size={8} split={<Divider type="vertical" />}>
            <Text type="secondary">{selectedCount} selected</Text>
            {bulkActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon && (
                  <span style={{ marginRight: 6 }}>{action.icon}</span>
                )}
                {action.label}
              </Button>
            ))}
          </Space>
        )}
      </Space>

      {/* Actions */}
      {actions && <Space size={8}>{actions}</Space>}
    </div>
  );
}
