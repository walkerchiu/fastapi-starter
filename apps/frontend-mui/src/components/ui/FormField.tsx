'use client';

import { type ReactNode, useId } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode | ((props: FormFieldChildProps) => ReactNode);
  className?: string;
  id?: string;
}

export interface FormFieldChildProps {
  id: string;
  'aria-invalid'?: 'true';
  'aria-describedby'?: string;
  'aria-required'?: 'true';
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = '',
  id: propId,
}: FormFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error && errorId, hint && !error && hintId]
    .filter(Boolean)
    .join(' ');

  const childProps: FormFieldChildProps = {
    id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined,
    'aria-required': required ? 'true' : undefined,
  };

  return (
    <FormControl error={!!error} fullWidth className={className}>
      {label && (
        <FormLabel htmlFor={id} required={required} sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}
      <Box>
        {typeof children === 'function' ? children(childProps) : children}
      </Box>
      {error && <FormHelperText id={errorId}>{error}</FormHelperText>}
      {hint && !error && (
        <FormHelperText id={hintId} sx={{ color: 'text.secondary' }}>
          {hint}
        </FormHelperText>
      )}
    </FormControl>
  );
}
