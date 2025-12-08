import { type InputHTMLAttributes, forwardRef, useId } from 'react';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, description, error, className = '', id: propId, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const baseCheckboxStyles =
      'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:text-indigo-500 dark:focus:ring-indigo-500';

    const checkboxStyles = error
      ? `${baseCheckboxStyles} border-red-300 dark:border-red-700`
      : baseCheckboxStyles;

    const describedBy = [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`${checkboxStyles} ${className}`.trim()}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy || undefined}
            {...props}
          />
        </div>
        {(label || description || error) && (
          <div className="ml-3 text-sm leading-6">
            {label && (
              <label
                htmlFor={id}
                className="font-medium text-gray-900 dark:text-gray-100"
              >
                {label}
              </label>
            )}
            {description && !error && (
              <p
                id={descriptionId}
                className="text-gray-500 dark:text-gray-400"
              >
                {description}
              </p>
            )}
            {error && (
              <p id={errorId} className="text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
