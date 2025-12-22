import { type ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: ReactNode;
  valueClassName?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  valueClassName = 'text-3xl font-bold text-indigo-600 dark:text-indigo-400',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`rounded-lg bg-white p-6 shadow dark:bg-gray-800 ${className}`.trim()}
    >
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <p className={`mt-2 ${valueClassName}`}>{value}</p>
    </div>
  );
}
