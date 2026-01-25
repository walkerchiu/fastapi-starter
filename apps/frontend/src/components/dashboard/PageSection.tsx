'use client';

import { useState, type ReactNode } from 'react';

export interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
}: PageSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const hasHeader = title || description || actions;

  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      {hasHeader && (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {collapsible && (
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Expand section' : 'Collapse section'}
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}
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
            )}
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {(!collapsible || !collapsed) && <div className="p-6">{children}</div>}
    </section>
  );
}
