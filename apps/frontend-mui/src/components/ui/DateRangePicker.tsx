'use client';

import { forwardRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateRangePicker as MuiDateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import type { DateRange as MuiDateRange } from '@mui/x-date-pickers-pro';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DateRangePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      label,
      error,
      hint,
      value = { startDate: null, endDate: null },
      onChange,
      minDate,
      maxDate,
      dateFormat = 'yyyy-MM-dd',
      disabled = false,
      className,
    },
    ref,
  ) => {
    const handleChange = (newValue: MuiDateRange<Date>) => {
      onChange?.({
        startDate: newValue[0],
        endDate: newValue[1],
      });
    };

    const muiValue: MuiDateRange<Date> = [value.startDate, value.endDate];

    return (
      <Box ref={ref} className={className}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDateRangePicker
            value={muiValue}
            onChange={handleChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            format={dateFormat}
            slots={{ field: SingleInputDateRangeField }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                label: label,
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

DateRangePicker.displayName = 'DateRangePicker';
