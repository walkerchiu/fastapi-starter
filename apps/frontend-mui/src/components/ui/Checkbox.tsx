'use client';

import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      className = '',
      id: propId,
      checked,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const describedBy = [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(' ');

    const checkbox = (
      <MuiCheckbox
        inputRef={ref}
        id={id}
        checked={checked}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        disabled={disabled}
        inputProps={{
          'aria-invalid': error ? 'true' : undefined,
          'aria-describedby': describedBy || undefined,
          ...props,
        }}
        sx={{ p: 0.5 }}
      />
    );

    return (
      <FormControl error={!!error} className={className}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          {label ? (
            <FormControlLabel
              control={checkbox}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {label}
                  </Typography>
                  {description && !error && (
                    <Typography
                      id={descriptionId}
                      variant="caption"
                      color="text.secondary"
                    >
                      {description}
                    </Typography>
                  )}
                </Box>
              }
              sx={{ alignItems: 'flex-start', ml: 0 }}
            />
          ) : (
            checkbox
          )}
        </Box>
        {error && <FormHelperText id={errorId}>{error}</FormHelperText>}
      </FormControl>
    );
  },
);

Checkbox.displayName = 'Checkbox';
