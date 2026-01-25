import { type ReactNode } from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface FormSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  action,
  children,
}: FormSectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
      <Paper variant="outlined" sx={{ p: 3 }}>
        {children}
      </Paper>
    </Box>
  );
}
