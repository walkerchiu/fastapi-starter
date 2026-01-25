'use client';

import { forwardRef, useState, useCallback } from 'react';

export type CopyButtonSize = 'sm' | 'md' | 'lg';
export type CopyButtonVariant = 'default' | 'ghost' | 'outline';

export interface CopyButtonProps {
  value: string;
  onCopySuccess?: (value: string) => void;
  size?: CopyButtonSize;
  variant?: CopyButtonVariant;
  successDuration?: number;
  label?: string;
  successLabel?: string;
  disabled?: boolean;
  className?: string;
}

const sizeStyles: Record<CopyButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconSizes: Record<CopyButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const variantStyles: Record<CopyButtonVariant, string> = {
  default:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
  ghost:
    'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
  outline:
    'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
};

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      onCopySuccess,
      size = 'md',
      variant = 'ghost',
      successDuration = 2000,
      label = 'Copy to clipboard',
      successLabel = 'Copied!',
      disabled = false,
      className = '',
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      if (disabled) return;

      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onCopySuccess?.(value);

        setTimeout(() => {
          setCopied(false);
        }, successDuration);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }, [value, disabled, onCopySuccess, successDuration]);

    const combinedClassName = [
      'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
      sizeStyles[size],
      variantStyles[variant],
      copied ? 'text-green-600 dark:text-green-400' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconClassName = iconSizes[size];

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        disabled={disabled}
        className={combinedClassName}
        aria-label={copied ? successLabel : label}
        title={copied ? successLabel : label}
      >
        {copied ? (
          <svg
            className={iconClassName}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className={iconClassName}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    );
  },
);

CopyButton.displayName = 'CopyButton';
