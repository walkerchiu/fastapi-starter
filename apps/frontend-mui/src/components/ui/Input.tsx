'use client';

import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import TextField from '@mui/material/TextField';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, className = '', id: propId, color: _color, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;

    return (
      <TextField
        inputRef={ref}
        id={id}
        label={label}
        error={!!error}
        helperText={error || hint}
        fullWidth
        size="small"
        className={className}
        slotProps={{
          input: {
            ...props,
          },
        }}
        sx={{
          '& .MuiInputBase-input': {
            py: 1.5,
          },
        }}
      />
    );
  },
);

Input.displayName = 'Input';
