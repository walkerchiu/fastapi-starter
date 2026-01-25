'use client';

import { forwardRef, useId } from 'react';
import { Switch as AntSwitch } from 'antd';

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

const sizeMap: Record<SwitchSize, 'small' | 'default'> = {
  sm: 'small',
  md: 'default',
  lg: 'default',
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
      className,
      id: propId,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const descriptionId = `${id}-description`;

    const handleChange = (newChecked: boolean) => {
      if (onChange) {
        onChange(newChecked);
      }
    };

    const switchElement = (
      <AntSwitch
        ref={ref}
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        size={sizeMap[size]}
        className={!label && !description ? className : undefined}
        style={
          size === 'lg'
            ? {
                minWidth: 56,
                height: 28,
              }
            : undefined
        }
        aria-describedby={description ? descriptionId : undefined}
      />
    );

    if (!label && !description) {
      return switchElement;
    }

    return (
      <div className={`flex items-start ${className || ''}`}>
        <div className="flex h-6 items-center">{switchElement}</div>
        <div className="ml-3">
          {label && (
            <label
              htmlFor={id}
              className={`text-sm font-medium ${
                disabled
                  ? 'text-gray-400'
                  : 'text-gray-900 dark:text-gray-100 cursor-pointer'
              }`}
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
