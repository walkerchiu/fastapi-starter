import { type ReactNode, useId } from 'react';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode | ((props: FormFieldChildProps) => ReactNode);
  className?: string;
  id?: string;
}

export interface FormFieldChildProps {
  id: string;
  'aria-invalid'?: 'true';
  'aria-describedby'?: string;
  'aria-required'?: 'true';
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = '',
  id: propId,
}: FormFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error && errorId, hint && !error && hintId]
    .filter(Boolean)
    .join(' ');

  const childProps: FormFieldChildProps = {
    id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined,
    'aria-required': required ? 'true' : undefined,
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500 dark:text-red-400">*</span>
          )}
        </label>
      )}
      <div className={label ? 'mt-2' : ''}>
        {typeof children === 'function' ? children(childProps) : children}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}
