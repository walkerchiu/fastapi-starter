'use client';

import { useState, type ReactNode, type FormEvent } from 'react';

export interface DashboardHeaderProps {
  logo?: ReactNode;
  title?: string;
  showMenuToggle?: boolean;
  onMenuToggle?: () => void;
  actions?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  sticky?: boolean;
  className?: string;
}

export function DashboardHeader({
  logo,
  title,
  showMenuToggle = true,
  onMenuToggle,
  actions,
  searchPlaceholder = 'Search...',
  onSearch,
  showSearch = false,
  sticky = true,
  className = '',
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header
      className={`z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900 ${
        sticky ? 'sticky top-0' : ''
      } ${className}`}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {showMenuToggle && onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {logo && <div className="flex shrink-0 items-center">{logo}</div>}

        {title && (
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
        )}
      </div>

      {/* Center section - Search */}
      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          className="mx-4 hidden max-w-md flex-1 md:block"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </form>
      )}

      {/* Right section - Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
