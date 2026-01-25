'use client';

import { forwardRef, useId } from 'react';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id'
> {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  resize?: TextareaResize;
  id?: string;
}

const resizeStyles: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      rows = 4,
      maxLength,
      showCount = false,
      resize = 'vertical',
      className = '',
      id: propId,
      value,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const currentLength = typeof value === 'string' ? value.length : 0;

    const baseStyles =
      'block w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';

    const stateStyles = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:text-red-100 dark:placeholder-red-700 dark:focus:border-red-500'
      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400';

    const disabledStyles = disabled
      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
      : '';

    const combinedClassName = [
      baseStyles,
      stateStyles,
      disabledStyles,
      resizeStyles[resize],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const describedBy = [hint && !error && hintId, error && errorId]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          className={combinedClassName}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          {...props}
        />
        <div className="mt-1.5 flex justify-between">
          <div>
            {hint && !error && (
              <p
                id={hintId}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {hint}
              </p>
            )}
            {error && (
              <p
                id={errorId}
                className="text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
