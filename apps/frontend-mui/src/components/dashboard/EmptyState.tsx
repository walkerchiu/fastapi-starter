import { type ReactNode } from 'react';
import { Box, Typography, Avatar } from '@mui/material';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        textAlign: 'center',
      }}
    >
      {icon && (
        <Avatar
          sx={{
            mb: 2,
            width: 48,
            height: 48,
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          {icon}
        </Avatar>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: 'sm' }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}
