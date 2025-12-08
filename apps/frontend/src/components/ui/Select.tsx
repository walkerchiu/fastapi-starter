import { type SelectHTMLAttributes, forwardRef, useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      className = '',
      id: propId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const baseSelectStyles =
      'block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100';

    const selectStyles = error
      ? `${baseSelectStyles} ring-red-300 focus:ring-red-500 dark:ring-red-700 dark:focus:ring-red-500`
      : `${baseSelectStyles} ring-gray-300 focus:ring-indigo-600 dark:ring-gray-600 dark:focus:ring-indigo-500`;

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
          <select
            ref={ref}
            id={id}
            className={`${selectStyles} ${className}`.trim()}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy || undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
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

Select.displayName = 'Select';
