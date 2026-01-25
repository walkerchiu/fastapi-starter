'use client';

import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  type SelectChangeEvent,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

export type FilterType =
  | 'select'
  | 'multiselect'
  | 'date'
  | 'daterange'
  | 'search'
  | 'boolean';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset?: () => void;
  className?: string;
}

function FilterField({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (config.type) {
    case 'search':
      return (
        <TextField
          fullWidth
          size="small"
          placeholder={
            config.placeholder || `Search ${config.label.toLowerCase()}...`
          }
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth size="small">
          <InputLabel id={`filter-${config.key}-label`}>
            {config.placeholder || `All ${config.label}`}
          </InputLabel>
          <Select
            labelId={`filter-${config.key}-label`}
            value={(value as string) || ''}
            label={config.placeholder || `All ${config.label}`}
            onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
          >
            <MenuItem value="">
              <em>{config.placeholder || `All ${config.label}`}</em>
            </MenuItem>
            {config.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case 'boolean':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={(value as boolean) || false}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label={config.label}
        />
      );

    case 'date':
      return (
        <TextField
          fullWidth
          size="small"
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      );

    default:
      return null;
  }
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== undefined && v !== '' && v !== false,
  );

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: 2,
        }}
      >
        {filters.map((filter) => (
          <Box
            key={filter.key}
            sx={{
              flex: 1,
              minWidth: 200,
            }}
          >
            {filter.type !== 'boolean' && (
              <Box
                component="label"
                sx={{
                  display: 'block',
                  mb: 0.75,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                }}
              >
                {filter.label}
              </Box>
            )}
            <FilterField
              config={filter}
              value={values[filter.key]}
              onChange={(value) => onChange(filter.key, value)}
            />
          </Box>
        ))}

        {onReset && hasActiveFilters && (
          <Button
            variant="text"
            color="inherit"
            startIcon={<ClearIcon />}
            onClick={onReset}
            sx={{ flexShrink: 0 }}
          >
            Clear filters
          </Button>
        )}
      </Box>
    </Box>
  );
}
