'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';

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
      className = '',
      id,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleToggle = (optionValue: string) => {
      if (disabled) return;

      const isSelected = value.includes(optionValue);
      let newValue: string[];

      if (isSelected) {
        newValue = value.filter((v) => v !== optionValue);
      } else {
        if (maxItems && value.length >= maxItems) return;
        newValue = [...value, optionValue];
      }

      onChange?.(newValue);
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange?.(value.filter((v) => v !== optionValue));
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange?.([]);
      setSearchQuery('');
    };

    const selectedOptions = options.filter((option) =>
      value.includes(option.value),
    );

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
            className={`min-h-[42px] w-full rounded-md border px-3 py-2 flex flex-wrap gap-1 items-center cursor-pointer ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                : 'bg-white dark:bg-gray-900'
            } ${
              error
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400'
            }`}
            onClick={() => {
              if (!disabled) {
                setIsOpen(true);
                inputRef.current?.focus();
              }
            }}
          >
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => handleRemove(option.value, e)}
                  className="hover:text-blue-600 dark:hover:text-blue-300"
                  disabled={disabled}
                >
                  <svg
                    className="h-3 w-3"
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
              </span>
            ))}

            {searchable && (
              <input
                ref={inputRef}
                id={id}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={selectedOptions.length === 0 ? placeholder : ''}
                disabled={disabled}
                className="flex-1 min-w-[60px] outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                onFocus={() => setIsOpen(true)}
              />
            )}

            {!searchable && selectedOptions.length === 0 && (
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                {placeholder}
              </span>
            )}

            <div className="ml-auto flex items-center gap-1">
              {clearable && value.length > 0 && !disabled && (
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
                className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  const isDisabled =
                    option.disabled ||
                    (maxItems && !isSelected && value.length >= maxItems);

                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                        isDisabled
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => !isDisabled && handleToggle(option.value)}
                    >
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      {option.label}
                    </div>
                  );
                })
              )}
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

MultiSelect.displayName = 'MultiSelect';
