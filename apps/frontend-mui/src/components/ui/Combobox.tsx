'use client';

import { forwardRef, useState, useCallback, useEffect, useRef } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  label?: string;
  error?: string;
  hint?: string;
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  debounceMs?: number;
  className?: string;
  id?: string;
}

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      label,
      error,
      hint,
      options,
      value,
      onChange,
      onSearch,
      placeholder = 'Search...',
      disabled = false,
      clearable = true,
      loading = false,
      emptyMessage = 'No results found',
      debounceMs = 300,
      className,
      id,
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState('');
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const selectedOption =
      options.find((option) => option.value === value) || null;

    const debouncedSearch = useCallback(
      (query: string) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          onSearch?.(query);
        }, debounceMs);
      },
      [onSearch, debounceMs],
    );

    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, []);

    const handleInputChange = (
      _event: React.SyntheticEvent,
      newInputValue: string,
    ) => {
      setInputValue(newInputValue);
      if (onSearch) {
        debouncedSearch(newInputValue);
      }
    };

    const handleChange = (
      _event: React.SyntheticEvent,
      newValue: ComboboxOption | null,
    ) => {
      onChange?.(newValue?.value || '');
    };

    return (
      <Box ref={ref} className={className}>
        <Autocomplete
          id={id}
          options={options}
          value={selectedOption}
          onChange={handleChange}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          disabled={disabled}
          disableClearable={!clearable}
          loading={loading}
          getOptionLabel={(option) => option.label}
          getOptionDisabled={(option) => option.disabled || false}
          isOptionEqualToValue={(option, val) => option.value === val.value}
          noOptionsText={emptyMessage}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              error={!!error}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        {(hint || error) && (
          <FormHelperText error={!!error}>{error || hint}</FormHelperText>
        )}
      </Box>
    );
  },
);

Combobox.displayName = 'Combobox';
