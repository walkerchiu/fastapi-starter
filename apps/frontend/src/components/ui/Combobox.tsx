'use client';

import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';

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
      className = '',
      id,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          if (selectedOption) {
            setSearchQuery(selectedOption.label);
          } else {
            setSearchQuery('');
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOption]);

    useEffect(() => {
      if (selectedOption) {
        setSearchQuery(selectedOption.label);
      }
    }, [selectedOption]);

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

    const filteredOptions = onSearch
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      setIsOpen(true);

      if (onSearch) {
        debouncedSearch(query);
      }
    };

    const handleSelect = (optionValue: string) => {
      const option = options.find((o) => o.value === optionValue);
      if (option) {
        setSearchQuery(option.label);
        onChange?.(optionValue);
        setIsOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      setSearchQuery('');
      onChange?.('');
      onSearch?.('');
    };

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
            className={`w-full rounded-md border px-3 py-2 flex items-center ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                : 'bg-white dark:bg-gray-900'
            } ${
              error
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400'
            }`}
          >
            <input
              ref={inputRef}
              id={id}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
            />

            <div className="flex items-center gap-1 ml-2">
              {loading && (
                <svg
                  className="h-4 w-4 text-gray-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {clearable && value && !disabled && !loading && (
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
              {loading ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 text-sm cursor-pointer ${
                      option.disabled
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : option.value === value
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                  >
                    {option.label}
                  </div>
                ))
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

Combobox.displayName = 'Combobox';
