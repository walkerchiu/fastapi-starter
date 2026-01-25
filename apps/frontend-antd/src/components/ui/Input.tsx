import { forwardRef } from 'react';
import { Input as AntInput } from 'antd';
import type { InputRef } from 'antd';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  size?: InputSize;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  maxLength?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

const sizeMap: Record<InputSize, 'small' | 'middle' | 'large'> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

export const Input = forwardRef<InputRef, InputProps>(
  (
    {
      type = 'text',
      size = 'md',
      placeholder,
      value,
      defaultValue,
      disabled,
      readOnly,
      required,
      maxLength,
      prefix,
      suffix,
      onChange,
      onBlur,
      onFocus,
      className,
      id,
      name,
      autoComplete,
      autoFocus,
    },
    ref,
  ) => {
    const InputComponent = type === 'password' ? AntInput.Password : AntInput;

    return (
      <InputComponent
        ref={ref}
        type={type === 'password' ? undefined : type}
        size={sizeMap[size]}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        prefix={prefix}
        suffix={suffix}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        className={className}
        id={id}
        name={name}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
    );
  },
);

Input.displayName = 'Input';
