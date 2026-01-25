'use client';

import { type ReactNode } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick: () => void;
}

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  selectedCount?: number;
  bulkActions?: BulkAction[];
  className?: string;
}

function mapVariantToMui(
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
) {
  switch (variant) {
    case 'primary':
      return { variant: 'contained' as const, color: 'primary' as const };
    case 'secondary':
      return { variant: 'outlined' as const, color: 'primary' as const };
    case 'danger':
      return { variant: 'contained' as const, color: 'error' as const };
    case 'ghost':
    default:
      return { variant: 'text' as const, color: 'inherit' as const };
  }
}

export function DataTableToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  selectedCount = 0,
  bulkActions = [],
}: DataTableToolbarProps) {
  const showBulkActions = selectedCount > 0 && bulkActions.length > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: 2 }}>
        {/* Search */}
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ width: '100%', maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Selected count and bulk actions */}
        {showBulkActions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedCount} selected
            </Typography>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 16, alignSelf: 'center' }}
            />
            {bulkActions.map((action) => {
              const muiProps = mapVariantToMui(action.variant);
              return (
                <Button
                  key={action.key}
                  size="small"
                  onClick={action.onClick}
                  startIcon={action.icon}
                  {...muiProps}
                >
                  {action.label}
                </Button>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Actions */}
      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}
