'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';

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

const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day);
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

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
      dateFormat = 'yyyy-MM-dd',
      clearable = true,
      disabled = false,
      placeholder = 'Select date range',
      className = '',
      id,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(
      () => value.startDate || new Date(),
    );
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSelectingEnd(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
      if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999)))
        return true;
      return false;
    };

    const isInRange = (date: Date): boolean => {
      if (!value.startDate) return false;
      const endDate = selectingEnd && hoverDate ? hoverDate : value.endDate;
      if (!endDate) return false;
      return date >= value.startDate && date <= endDate;
    };

    const handleDateSelect = (day: number) => {
      const newDate = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        day,
      );
      if (isDateDisabled(newDate)) return;

      if (!selectingEnd) {
        onChange?.({ startDate: newDate, endDate: null });
        setSelectingEnd(true);
      } else {
        if (value.startDate && newDate < value.startDate) {
          onChange?.({ startDate: newDate, endDate: value.startDate });
        } else {
          onChange?.({ ...value, endDate: newDate });
        }
        setSelectingEnd(false);
        setIsOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.({ startDate: null, endDate: null });
      setSelectingEnd(false);
    };

    const handlePrevMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const displayValue = (): string => {
      if (!value.startDate) return '';
      if (!value.endDate) return formatDate(value.startDate, dateFormat);
      return `${formatDate(value.startDate, dateFormat)} - ${formatDate(value.endDate, dateFormat)}`;
    };

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const daysInMonth = getDaysInMonth(
      viewDate.getFullYear(),
      viewDate.getMonth(),
    );
    const firstDay = getFirstDayOfMonth(
      viewDate.getFullYear(),
      viewDate.getMonth(),
    );

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          <div
            className={`w-full rounded-md border px-3 py-2 flex items-center cursor-pointer ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                : 'bg-white dark:bg-gray-900'
            } ${
              error
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400'
            }`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <input
              id={id}
              type="text"
              readOnly
              value={displayValue()}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm cursor-pointer"
            />

            <div className="flex items-center gap-1 ml-2">
              {clearable && (value.startDate || value.endDate) && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                </button>
              )}
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {selectingEnd ? 'Select end date' : 'Select start date'}
              </div>

              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <svg
                    className="h-4 w-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <svg
                    className="h-4 w-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="w-8 h-8" />;
                  }

                  const date = new Date(
                    viewDate.getFullYear(),
                    viewDate.getMonth(),
                    day,
                  );
                  const isDisabled = isDateDisabled(date);
                  const isStart =
                    value.startDate &&
                    value.startDate.getDate() === day &&
                    value.startDate.getMonth() === viewDate.getMonth() &&
                    value.startDate.getFullYear() === viewDate.getFullYear();
                  const isEnd =
                    value.endDate &&
                    value.endDate.getDate() === day &&
                    value.endDate.getMonth() === viewDate.getMonth() &&
                    value.endDate.getFullYear() === viewDate.getFullYear();
                  const inRange = isInRange(date);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      onMouseEnter={() => selectingEnd && setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                      disabled={isDisabled}
                      className={`w-8 h-8 text-sm rounded ${
                        isDisabled
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : isStart || isEnd
                            ? 'bg-blue-600 text-white'
                            : inRange
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
