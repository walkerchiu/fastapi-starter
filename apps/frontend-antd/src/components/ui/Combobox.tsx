'use client';

import { forwardRef, useCallback, useRef, useEffect } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  label?: string;
  error?: string;
  hint?: string;
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  debounceMs?: number;
  className?: string;
  id?: string;
}

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      label,
      error,
      hint,
      options,
      value,
      onChange,
      onSearch,
      placeholder = 'Search...',
      disabled = false,
      clearable = true,
      loading = false,
      emptyMessage = 'No results found',
      debounceMs = 300,
      className,
      id,
    },
    ref,
  ) => {
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    const debouncedSearch = useCallback(
      (query: string) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          onSearch?.(query);
        }, debounceMs);
      },
      [onSearch, debounceMs],
    );

    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, []);

    const handleSearch = (query: string) => {
      if (onSearch) {
        debouncedSearch(query);
      }
    };

    const handleChange = (newValue: string) => {
      onChange?.(newValue || '');
    };

    const selectOptions: SelectProps['options'] = options.map((option) => ({
      value: option.value,
      label: option.label,
      disabled: option.disabled,
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
          showSearch
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={value || undefined}
          onChange={handleChange}
          onSearch={onSearch ? handleSearch : undefined}
          options={selectOptions}
          disabled={disabled}
          allowClear={clearable}
          loading={loading}
          filterOption={
            onSearch
              ? false
              : (input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
          }
          status={error ? 'error' : undefined}
          notFoundContent={
            loading ? (
              <div className="flex items-center justify-center py-2">
                <Spin size="small" />
              </div>
            ) : (
              emptyMessage
            )
          }
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

Combobox.displayName = 'Combobox';
