'use client';

import { forwardRef, useId } from 'react';
import MuiSwitch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

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

const sizeMap: Record<SwitchSize, 'small' | 'medium'> = {
  sm: 'small',
  md: 'medium',
  lg: 'medium',
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.checked);
      }
    };

    const switchElement = (
      <MuiSwitch
        inputRef={ref}
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        size={sizeMap[size]}
        className={!label && !description ? className : undefined}
        sx={
          size === 'lg'
            ? {
                width: 62,
                height: 34,
                padding: 0,
                '& .MuiSwitch-switchBase': {
                  padding: 0,
                  margin: '4px',
                  transitionDuration: '300ms',
                  '&.Mui-checked': {
                    transform: 'translateX(28px)',
                  },
                },
                '& .MuiSwitch-thumb': {
                  width: 26,
                  height: 26,
                },
                '& .MuiSwitch-track': {
                  borderRadius: 17,
                },
              }
            : undefined
        }
      />
    );

    if (!label && !description) {
      return switchElement;
    }

    return (
      <Box className={className}>
        <FormControlLabel
          control={switchElement}
          label={label || ''}
          disabled={disabled}
          sx={{
            marginLeft: 0,
            '& .MuiFormControlLabel-label': {
              marginLeft: 1,
            },
          }}
        />
        {description && (
          <FormHelperText sx={{ marginLeft: '44px', marginTop: -0.5 }}>
            {description}
          </FormHelperText>
        )}
      </Box>
    );
  },
);

Switch.displayName = 'Switch';
