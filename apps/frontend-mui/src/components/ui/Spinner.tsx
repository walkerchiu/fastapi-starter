'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  'aria-label'?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 16,
  md: 32,
  lg: 48,
};

export function Spinner({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
  return (
    <Box className={className} sx={{ display: 'inline-flex' }} role="status">
      <CircularProgress size={sizeMap[size]} aria-label={ariaLabel} />
      <Box
        component="span"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {ariaLabel}
      </Box>
    </Box>
  );
}
