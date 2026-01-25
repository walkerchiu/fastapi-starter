'use client';

import { forwardRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';

export interface DatePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      label,
      error,
      hint,
      value = null,
      onChange,
      minDate,
      maxDate,
      dateFormat = 'yyyy-MM-dd',
      clearable = true,
      disabled = false,
      placeholder,
      className,
    },
    ref,
  ) => {
    const handleChange = (newValue: Date | null) => {
      onChange?.(newValue);
    };

    return (
      <Box ref={ref} className={className}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label={label}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            format={dateFormat}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                placeholder: placeholder,
              },
              field: {
                clearable: clearable,
              },
            }}
          />
        </LocalizationProvider>
        {(hint || error) && (
          <FormHelperText error={!!error}>{error || hint}</FormHelperText>
        )}
      </Box>
    );
  },
);

DatePicker.displayName = 'DatePicker';
