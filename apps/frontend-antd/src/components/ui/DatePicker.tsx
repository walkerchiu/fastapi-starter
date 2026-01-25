'use client';

import { forwardRef } from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

export interface DatePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      label,
      error,
      hint,
      value,
      onChange,
      minDate,
      maxDate,
      dateFormat = 'YYYY-MM-DD',
      clearable = true,
      disabled = false,
      placeholder = 'Select date',
      className,
      id,
    },
    ref,
  ) => {
    const handleChange = (date: Dayjs | null) => {
      onChange?.(date ? date.toDate() : null);
    };

    const disabledDate = (current: Dayjs): boolean => {
      if (!current) return false;
      if (minDate && current.isBefore(dayjs(minDate), 'day')) return true;
      if (maxDate && current.isAfter(dayjs(maxDate), 'day')) return true;
      return false;
    };

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

        <AntDatePicker
          id={id}
          value={value ? dayjs(value) : null}
          onChange={handleChange}
          disabled={disabled}
          allowClear={clearable}
          placeholder={placeholder}
          format={dateFormat}
          disabledDate={minDate || maxDate ? disabledDate : undefined}
          status={error ? 'error' : undefined}
          style={{ width: '100%' }}
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

DatePicker.displayName = 'DatePicker';
