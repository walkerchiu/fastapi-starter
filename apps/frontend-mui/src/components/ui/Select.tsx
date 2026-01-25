'use client';

import React, { forwardRef, useId } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
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
      name,
      value,
      onChange,
      disabled,
      required,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;

    return (
      <TextField
        select
        inputRef={ref}
        id={id}
        name={name}
        label={label}
        error={!!error}
        helperText={error || hint}
        fullWidth
        size="small"
        className={className}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        slotProps={{
          select: {
            displayEmpty: !!placeholder,
          },
        }}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  },
);

Select.displayName = 'Select';
