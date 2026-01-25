'use client';

import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';

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
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <Select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          options={[
            { value: '', label: config.placeholder || `All ${config.label}` },
            ...(config.options || []),
          ]}
        />
      );

    case 'boolean':
      return (
        <Checkbox
          checked={(value as boolean) || false}
          onChange={(e) => onChange(e.target.checked)}
          label={config.label}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
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
  className = '',
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== undefined && v !== '' && v !== false,
  );

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
    >
      <div className="flex flex-wrap items-end gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[200px] flex-1">
            {filter.type !== 'boolean' && (
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <Button variant="ghost" onClick={onReset} className="shrink-0">
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
