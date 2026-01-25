'use client';

import { type ReactNode } from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

export interface LoadingOverlayProps {
  loading: boolean;
  children: ReactNode;
  text?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  loading,
  children,
  text,
  blur = true,
}: LoadingOverlayProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <Backdrop
        open={loading}
        sx={{
          position: 'absolute',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: blur ? 'blur(4px)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={40} />
        {text && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {text}
          </Typography>
        )}
      </Backdrop>
    </Box>
  );
}
