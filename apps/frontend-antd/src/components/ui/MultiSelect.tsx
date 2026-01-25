'use client';

import { forwardRef } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  maxItems?: number;
  className?: string;
  id?: string;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      value = [],
      onChange,
      placeholder = 'Select...',
      disabled = false,
      clearable = true,
      searchable = true,
      maxItems,
      className,
      id,
    },
    ref,
  ) => {
    const handleChange = (newValue: string[]) => {
      if (maxItems && newValue.length > maxItems) return;
      onChange?.(newValue);
    };

    const selectOptions: SelectProps['options'] = options.map((option) => ({
      value: option.value,
      label: option.label,
      disabled:
        option.disabled ||
        (maxItems
          ? !value.includes(option.value) && value.length >= maxItems
          : false),
    }));

    return (
      <div ref={ref} className={className}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <Select
          id={id}
          mode="multiple"
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          options={selectOptions}
          disabled={disabled}
          allowClear={clearable}
          showSearch={searchable}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          status={error ? 'error' : undefined}
          maxTagCount="responsive"
        />

        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';
