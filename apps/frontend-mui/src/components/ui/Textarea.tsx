'use client';

import { forwardRef, useId } from 'react';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  resize?: TextareaResize;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

const resizeMap: Record<TextareaResize, string> = {
  none: 'none',
  vertical: 'vertical',
  horizontal: 'horizontal',
  both: 'both',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      rows = 4,
      maxLength,
      showCount = false,
      resize = 'vertical',
      value = '',
      onChange,
      disabled,
      placeholder,
      className,
      id: propId,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <Box className={className} sx={{ width: '100%' }}>
        <TextField
          inputRef={ref}
          id={id}
          label={label}
          multiline
          rows={rows}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          error={!!error}
          helperText={error || hint}
          fullWidth
          slotProps={{
            input: {
              sx: {
                resize: resizeMap[resize],
              },
            },
            htmlInput: {
              maxLength,
            },
          }}
        />
        {showCount && maxLength && (
          <FormHelperText sx={{ textAlign: 'right', mt: -2.5 }}>
            {currentLength}/{maxLength}
          </FormHelperText>
        )}
      </Box>
    );
  },
);

Textarea.displayName = 'Textarea';
