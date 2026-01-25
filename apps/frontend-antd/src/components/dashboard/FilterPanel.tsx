'use client';

import { Card, Space, DatePicker } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

export type FilterType =
  | 'select'
  | 'multiselect'
  | 'date'
  | 'daterange'
  | 'search'
  | 'boolean';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset?: () => void;
  className?: string;
}

function FilterField({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (config.type) {
    case 'search':
      return (
        <Input
          type="text"
          placeholder={
            config.placeholder || `Search ${config.label.toLowerCase()}...`
          }
          value={(value as string) || ''}
          onChange={(val) => onChange(val)}
        />
      );

    case 'select':
      return (
        <Select
          value={(value as string) || undefined}
          onChange={(val) => onChange(val)}
          placeholder={config.placeholder || `All ${config.label}`}
          options={config.options || []}
          allowClear
          fullWidth
        />
      );

    case 'boolean':
      return (
        <Checkbox
          checked={(value as boolean) || false}
          onChange={(checked) => onChange(checked)}
        >
          {config.label}
        </Checkbox>
      );

    case 'date':
      return (
        <DatePicker
          style={{ width: '100%' }}
          onChange={(_date, dateString) => onChange(dateString)}
        />
      );

    default:
      return null;
  }
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  className,
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== undefined && v !== '' && v !== false,
  );

  return (
    <Card
      className={className}
      size="small"
      style={{ backgroundColor: '#fafafa' }}
    >
      <Space wrap size={16} style={{ width: '100%' }}>
        {filters.map((filter) => (
          <div key={filter.key} style={{ minWidth: 200, flex: 1 }}>
            {filter.type !== 'boolean' && (
              <label
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {filter.label}
              </label>
            )}
            <FilterField
              config={filter}
              value={values[filter.key]}
              onChange={(value) => onChange(filter.key, value)}
            />
          </div>
        ))}

        {onReset && hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onReset}
            style={{ alignSelf: 'flex-end' }}
          >
            <CloseOutlined style={{ marginRight: 6 }} />
            Clear filters
          </Button>
        )}
      </Space>
    </Card>
  );
}
