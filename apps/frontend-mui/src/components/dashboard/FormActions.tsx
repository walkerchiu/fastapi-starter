import { type ReactNode } from 'react';
import { Box } from '@mui/material';

export interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  className?: string;
}

export function FormActions({
  children,
  align = 'right',
  sticky = false,
}: FormActionsProps) {
  const alignmentMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        pt: 3,
        justifyContent: alignmentMap[align],
        ...(sticky && {
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          py: 2,
          zIndex: 1,
        }),
      }}
    >
      {children}
    </Box>
  );
}
