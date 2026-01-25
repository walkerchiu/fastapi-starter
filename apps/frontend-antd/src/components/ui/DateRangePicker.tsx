'use client';

import { forwardRef } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DateRangePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      label,
      error,
      hint,
      value = { startDate: null, endDate: null },
      onChange,
      minDate,
      maxDate,
      dateFormat = 'YYYY-MM-DD',
      clearable = true,
      disabled = false,
      placeholder,
      className,
      id,
    },
    ref,
  ) => {
    const handleChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (!dates) {
        onChange?.({ startDate: null, endDate: null });
        return;
      }
      onChange?.({
        startDate: dates[0] ? dates[0].toDate() : null,
        endDate: dates[1] ? dates[1].toDate() : null,
      });
    };

    const disabledDate = (current: Dayjs): boolean => {
      if (!current) return false;
      if (minDate && current.isBefore(dayjs(minDate), 'day')) return true;
      if (maxDate && current.isAfter(dayjs(maxDate), 'day')) return true;
      return false;
    };

    const rangeValue: [Dayjs | null, Dayjs | null] = [
      value.startDate ? dayjs(value.startDate) : null,
      value.endDate ? dayjs(value.endDate) : null,
    ];

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

        <RangePicker
          id={id}
          value={rangeValue}
          onChange={handleChange}
          disabled={disabled}
          allowClear={clearable}
          placeholder={placeholder ? [placeholder, placeholder] : undefined}
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

DateRangePicker.displayName = 'DateRangePicker';
