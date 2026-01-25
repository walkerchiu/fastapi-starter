'use client';

import React, { forwardRef, useId } from 'react';
import MuiRadio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  error?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface RadioProps {
  id?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      className = '',
      id: propId,
      name,
      value,
      disabled,
      checked,
      onChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const descriptionId = `${id}-description`;

    const radio = (
      <MuiRadio
        inputRef={ref}
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        checked={checked}
        onChange={onChange}
        inputProps={{
          'aria-describedby': description ? descriptionId : undefined,
        }}
        sx={{ p: 0.5 }}
      />
    );

    return (
      <Box
        className={className}
        sx={{ display: 'flex', alignItems: 'flex-start' }}
      >
        {label ? (
          <FormControlLabel
            control={radio}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {label}
                </Typography>
                {description && (
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
          radio
        )}
      </Box>
    );
  },
);

Radio.displayName = 'Radio';

export function RadioGroupComponent({
  name,
  label,
  options,
  value,
  error,
  onChange,
  className = '',
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <FormControl error={!!error} className={className} component="fieldset">
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        sx={{ mt: label ? 1.5 : 0, gap: 1.5 }}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
      {error && <FormHelperText id={errorId}>{error}</FormHelperText>}
    </FormControl>
  );
}

export { RadioGroupComponent as RadioGroup };
