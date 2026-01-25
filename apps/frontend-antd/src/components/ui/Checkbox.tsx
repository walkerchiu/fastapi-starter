import { forwardRef } from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxRef } from 'antd';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
}

export const Checkbox = forwardRef<CheckboxRef, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      disabled,
      indeterminate,
      onChange,
      children,
      className,
      id,
      name,
    },
    ref,
  ) => {
    return (
      <AntCheckbox
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        indeterminate={indeterminate}
        onChange={(e) => onChange?.(e.target.checked)}
        className={className}
        id={id}
        name={name}
      >
        {children}
      </AntCheckbox>
    );
  },
);

Checkbox.displayName = 'Checkbox';
