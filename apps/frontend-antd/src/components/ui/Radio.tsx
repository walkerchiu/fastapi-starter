'use client';

import { forwardRef, useId } from 'react';
import { Radio as AntRadio, Typography } from 'antd';
import type { RadioGroupProps as AntRadioGroupProps } from 'antd';

const { Text } = Typography;

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps {
  checked?: boolean;
  disabled?: boolean;
  value?: string;
  label?: string;
  description?: string;
  onChange?: () => void;
  name?: string;
  className?: string;
}

export interface RadioGroupProps {
  name?: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', ...props }, ref) => {
    return (
      <div className={className}>
        <AntRadio ref={ref as never} {...props}>
          {label}
          {description && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {description}
            </Text>
          )}
        </AntRadio>
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
  defaultValue,
  error,
  disabled,
  onChange,
  className = '',
  direction = 'horizontal',
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  const groupProps: AntRadioGroupProps = {
    value,
    defaultValue,
    disabled,
    onChange: (e) => onChange?.(e.target.value),
    name,
  };

  return (
    <fieldset className={className}>
      {label && (
        <legend
          style={{
            marginBottom: 8,
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          {label}
        </legend>
      )}
      <AntRadio.Group
        {...groupProps}
        style={{
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          gap: direction === 'vertical' ? 8 : 16,
        }}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((option) => (
          <AntRadio
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
            {option.description && (
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: 12, marginTop: 2 }}
              >
                {option.description}
              </Text>
            )}
          </AntRadio>
        ))}
      </AntRadio.Group>
      {error && (
        <Text
          id={errorId}
          type="danger"
          style={{ display: 'block', marginTop: 8, fontSize: 14 }}
        >
          {error}
        </Text>
      )}
    </fieldset>
  );
}
