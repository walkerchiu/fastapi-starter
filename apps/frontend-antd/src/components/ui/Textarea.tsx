'use client';

import { forwardRef, useId } from 'react';
import { Input } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';

const { TextArea: AntTextArea } = Input;

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  resize?: TextareaResize;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

const resizeStyles: Record<TextareaResize, React.CSSProperties['resize']> = {
  none: 'none',
  vertical: 'vertical',
  horizontal: 'horizontal',
  both: 'both',
};

export const Textarea = forwardRef<TextAreaRef, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      rows = 4,
      maxLength,
      showCount = false,
      resize = 'vertical',
      value,
      onChange,
      disabled,
      placeholder,
      className,
      id: propId,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const describedBy = [hint && !error && hintId, error && errorId]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`w-full ${className || ''}`}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <AntTextArea
          ref={ref}
          id={id}
          rows={rows}
          maxLength={maxLength}
          showCount={showCount}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          status={error ? 'error' : undefined}
          style={{ resize: resizeStyles[resize] }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
        />
        {(hint || error) && (
          <div className="mt-1">
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
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
