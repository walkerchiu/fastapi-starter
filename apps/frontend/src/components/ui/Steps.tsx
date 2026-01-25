'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';
export type StepsDirection = 'horizontal' | 'vertical';
export type StepsSize = 'sm' | 'md' | 'lg';

export interface StepItem {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: StepStatus;
}

export interface StepsProps {
  items: StepItem[];
  current?: number;
  direction?: StepsDirection;
  size?: StepsSize;
  onChange?: (step: number) => void;
  clickable?: boolean;
  className?: string;
}

const sizeStyles: Record<
  StepsSize,
  { icon: string; title: string; description: string }
> = {
  sm: {
    icon: 'h-6 w-6 text-xs',
    title: 'text-xs',
    description: 'text-xs',
  },
  md: {
    icon: 'h-8 w-8 text-sm',
    title: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    icon: 'h-10 w-10 text-base',
    title: 'text-base',
    description: 'text-sm',
  },
};

const statusStyles: Record<StepStatus, { icon: string; line: string }> = {
  pending: {
    icon: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    line: 'bg-gray-200 dark:bg-gray-700',
  },
  current: {
    icon: 'bg-blue-600 text-white dark:bg-blue-500',
    line: 'bg-gray-200 dark:bg-gray-700',
  },
  completed: {
    icon: 'bg-green-600 text-white dark:bg-green-500',
    line: 'bg-green-600 dark:bg-green-500',
  },
  error: {
    icon: 'bg-red-600 text-white dark:bg-red-500',
    line: 'bg-red-600 dark:bg-red-500',
  },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export const Steps = forwardRef<HTMLDivElement, StepsProps>(
  (
    {
      items,
      current = 0,
      direction = 'horizontal',
      size = 'md',
      onChange,
      clickable = false,
      className = '',
    },
    ref,
  ) => {
    const getStepStatus = (index: number, item: StepItem): StepStatus => {
      if (item.status) return item.status;
      if (index < current) return 'completed';
      if (index === current) return 'current';
      return 'pending';
    };

    const handleClick = (index: number) => {
      if (clickable && onChange) {
        onChange(index);
      }
    };

    const isHorizontal = direction === 'horizontal';

    return (
      <div
        ref={ref}
        className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      >
        {items.map((item, index) => {
          const status = getStepStatus(index, item);
          const isLast = index === items.length - 1;
          const styles = sizeStyles[size];
          const statusStyle = statusStyles[status];

          return (
            <div
              key={index}
              className={`flex ${isHorizontal ? 'flex-1 flex-col items-center' : 'flex-row'} ${
                clickable ? 'cursor-pointer' : ''
              }`}
              onClick={() => handleClick(index)}
            >
              <div
                className={`flex ${isHorizontal ? 'w-full items-center' : 'flex-col items-center'}`}
              >
                {/* Step Icon */}
                <div
                  className={`flex items-center justify-center rounded-full ${styles.icon} ${statusStyle.icon} flex-shrink-0`}
                >
                  {item.icon ? (
                    item.icon
                  ) : status === 'completed' ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : status === 'error' ? (
                    <ErrorIcon className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`${
                      isHorizontal ? 'h-0.5 flex-1 mx-2' : 'w-0.5 h-8 my-2'
                    } ${statusStyle.line}`}
                  />
                )}
              </div>

              {/* Step Content */}
              <div
                className={`${isHorizontal ? 'mt-2 text-center' : 'ml-3 flex-1'}`}
              >
                <div
                  className={`font-medium ${styles.title} ${
                    status === 'current'
                      ? 'text-blue-600 dark:text-blue-400'
                      : status === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {item.title}
                </div>
                {item.description && (
                  <div
                    className={`${styles.description} text-gray-500 dark:text-gray-400 mt-0.5`}
                  >
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

Steps.displayName = 'Steps';
