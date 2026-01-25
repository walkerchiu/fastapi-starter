import { type ReactNode } from 'react';
import Link from 'next/link';
import { Skeleton } from '../ui/Skeleton';

export interface StatItem {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  href?: string;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

function StatCard({ stat }: { stat: StatItem }) {
  const content = (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {stat.title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {stat.value}
          </p>
          {stat.change && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  stat.change.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stat.change.trend === 'up' ? '+' : '-'}
                {Math.abs(stat.change.value)}%
              </span>
              <svg
                className={`h-4 w-4 ${
                  stat.change.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'rotate-180 text-red-600 dark:text-red-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
          )}
        </div>
        {stat.icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            {stat.icon}
          </div>
        )}
      </div>
    </div>
  );

  if (stat.href) {
    return (
      <Link
        href={stat.href}
        className="block transition-shadow hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-20" />
          <Skeleton className="mt-2 h-4 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

export function StatsGrid({
  stats,
  columns = 4,
  loading = false,
  className = '',
}: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
        {Array.from({ length: columns }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={stat.title + index} stat={stat} />
      ))}
    </div>
  );
}
