'use client';

import { forwardRef } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  maxItems?: number;
  className?: string;
  id?: string;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      value = [],
      onChange,
      placeholder = 'Select...',
      disabled = false,
      clearable = true,
      searchable = true,
      maxItems,
      className,
      id,
    },
    ref,
  ) => {
    const selectedOptions = options.filter((option) =>
      value.includes(option.value),
    );

    const handleChange = (
      _event: React.SyntheticEvent,
      newValue: MultiSelectOption[],
    ) => {
      if (maxItems && newValue.length > maxItems) return;
      onChange?.(newValue.map((option) => option.value));
    };

    return (
      <Box ref={ref} className={className}>
        <Autocomplete
          multiple
          id={id}
          options={options}
          value={selectedOptions}
          onChange={handleChange}
          disableCloseOnSelect
          disabled={disabled}
          disableClearable={!clearable}
          getOptionLabel={(option) => option.label}
          getOptionDisabled={(option) =>
            option.disabled ||
            (maxItems
              ? !value.includes(option.value) && value.length >= maxItems
              : false)
          }
          isOptionEqualToValue={(option, val) => option.value === val.value}
          renderOption={(props, option, { selected }) => {
            const { key, ...restProps } = props;
            return (
              <li key={key} {...restProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.label}
              </li>
            );
          }}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...restProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={option.label}
                  size="small"
                  {...restProps}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={value.length === 0 ? placeholder : undefined}
              error={!!error}
              InputProps={{
                ...params.InputProps,
                readOnly: !searchable,
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

MultiSelect.displayName = 'MultiSelect';
