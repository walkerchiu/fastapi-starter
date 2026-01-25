import { type ReactNode } from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: ReactNode;
  status?: 'success' | 'error' | 'warning' | 'info';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString();
}

const statusColors = {
  success: 'bg-green-500 dark:bg-green-400',
  error: 'bg-red-500 dark:bg-red-400',
  warning: 'bg-yellow-500 dark:bg-yellow-400',
  info: 'bg-blue-500 dark:bg-blue-400',
};

const statusIconBg = {
  success:
    'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
  warning:
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
};

export function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Timeline dot/icon */}
            <div className="relative z-10 shrink-0">
              {item.icon ? (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    item.status
                      ? statusIconBg[item.status]
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {item.icon}
                </div>
              ) : (
                <div
                  className={`h-8 w-8 rounded-full border-4 border-white dark:border-gray-900 ${
                    item.status
                      ? statusColors[item.status]
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={`min-w-0 flex-1 pb-6 ${index === items.length - 1 ? 'pb-0' : ''}`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </h4>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(item.timestamp)}
                </time>
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
