'use client';

import { forwardRef, useId } from 'react';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

const sizeStyles: Record<
  SwitchSize,
  { track: string; thumb: string; translate: string }
> = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'h-7 w-14',
    thumb: 'h-6 w-6',
    translate: 'translate-x-7',
  },
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      size = 'md',
      label,
      description,
      className = '',
      id: propId,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const descriptionId = `${id}-description`;
    const sizeStyle = sizeStyles[size];

    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    const trackClassName = [
      'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
      sizeStyle.track,
      checked
        ? 'bg-indigo-600 dark:bg-indigo-500'
        : 'bg-gray-200 dark:bg-gray-700',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const thumbClassName = [
      'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
      sizeStyle.thumb,
      checked ? sizeStyle.translate : 'translate-x-0',
    ].join(' ');

    const switchElement = (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={trackClassName}
      >
        <span aria-hidden="true" className={thumbClassName} />
      </button>
    );

    if (!label && !description) {
      return switchElement;
    }

    return (
      <div className="flex items-start">
        <div className="flex h-6 items-center">{switchElement}</div>
        <div className="ml-3">
          {label && (
            <label
              htmlFor={id}
              className={`text-sm font-medium ${
                disabled
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-gray-100'
              } ${disabled ? '' : 'cursor-pointer'}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={descriptionId}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Switch.displayName = 'Switch';
