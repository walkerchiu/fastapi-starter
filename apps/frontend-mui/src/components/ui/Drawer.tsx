'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  size?: DrawerSize;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

const sizeMap: Record<DrawerPosition, Record<DrawerSize, number | string>> = {
  left: {
    sm: 256,
    md: 320,
    lg: 384,
    xl: 512,
    full: '100%',
  },
  right: {
    sm: 256,
    md: 320,
    lg: 384,
    xl: 512,
    full: '100%',
  },
  top: {
    sm: 128,
    md: 192,
    lg: 256,
    xl: 384,
    full: '100%',
  },
  bottom: {
    sm: 128,
    md: 192,
    lg: 256,
    xl: 384,
    full: '100%',
  },
};

const anchorMap: Record<DrawerPosition, 'left' | 'right' | 'top' | 'bottom'> = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
};

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      isOpen,
      onClose,
      position = 'right',
      size = 'md',
      title,
      children,
      showCloseButton = true,
      className,
    },
    ref,
  ) => {
    const dimension = sizeMap[position][size];
    const isHorizontal = position === 'left' || position === 'right';

    return (
      <MuiDrawer
        ref={ref}
        anchor={anchorMap[position]}
        open={isOpen}
        onClose={onClose}
        className={className}
        PaperProps={{
          sx: {
            width: isHorizontal ? dimension : '100%',
            height: !isHorizontal ? dimension : '100%',
          },
        }}
      >
        {(title || showCloseButton) && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
              }}
            >
              {title && (
                <Typography variant="h6" component="h2">
                  {title}
                </Typography>
              )}
              {showCloseButton && (
                <IconButton
                  onClick={onClose}
                  aria-label="Close drawer"
                  sx={{ ml: 'auto' }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
            <Divider />
          </>
        )}
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>{children}</Box>
      </MuiDrawer>
    );
  },
);

Drawer.displayName = 'Drawer';
