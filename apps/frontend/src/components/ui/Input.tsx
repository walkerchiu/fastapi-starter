import { type InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const baseInputStyles =
      'block w-full rounded-md border-0 px-3 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500';

    const inputStyles = error
      ? `${baseInputStyles} ring-red-300 focus:ring-red-500 dark:ring-red-700 dark:focus:ring-red-500`
      : `${baseInputStyles} ring-gray-300 focus:ring-indigo-600 dark:ring-gray-600 dark:focus:ring-indigo-500`;

    const describedBy = [error && errorId, hint && !error && hintId]
      .filter(Boolean)
      .join(' ');

    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
          >
            {label}
          </label>
        )}
        <div className={label ? 'mt-2' : ''}>
          <input
            ref={ref}
            id={id}
            className={`${inputStyles} ${className}`.trim()}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy || undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={hintId}
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
