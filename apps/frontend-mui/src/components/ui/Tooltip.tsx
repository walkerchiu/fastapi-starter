'use client';

import { type ReactNode } from 'react';
import MuiTooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

const positionMap: Record<
  TooltipPosition,
  'top' | 'bottom' | 'left' | 'right'
> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}: TooltipProps) {
  return (
    <MuiTooltip
      title={content}
      placement={positionMap[position]}
      enterDelay={delay}
      className={className}
      arrow
    >
      <Box component="span" sx={{ display: 'inline-block' }}>
        {children}
      </Box>
    </MuiTooltip>
  );
}
