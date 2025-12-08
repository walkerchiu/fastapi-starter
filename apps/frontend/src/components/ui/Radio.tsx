import { type InputHTMLAttributes, forwardRef, useId } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  error?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const descriptionId = `${id}-description`;

    const radioStyles =
      'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:text-indigo-500 dark:focus:ring-indigo-500';

    return (
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            ref={ref}
            id={id}
            type="radio"
            className={`${radioStyles} ${className}`.trim()}
            aria-describedby={description ? descriptionId : undefined}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm leading-6">
            {label && (
              <label
                htmlFor={id}
                className="font-medium text-gray-900 dark:text-gray-100"
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className="text-gray-500 dark:text-gray-400"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Radio.displayName = 'Radio';

export function RadioGroup({
  name,
  label,
  options,
  value,
  error,
  onChange,
  className = '',
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
          {label}
        </legend>
      )}
      <div
        className={`${label ? 'mt-3' : ''} space-y-3`}
        role="radiogroup"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onChange?.(option.value)}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}
