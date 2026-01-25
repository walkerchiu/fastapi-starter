import { type ReactNode } from 'react';
import { Box, Typography, Avatar } from '@mui/material';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: ReactNode;
  status?: 'success' | 'error' | 'warning' | 'info';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString();
}

const statusColors = {
  success: 'success.main',
  error: 'error.main',
  warning: 'warning.main',
  info: 'info.main',
};

const statusIconBgColors = {
  success: 'success.light',
  error: 'error.light',
  warning: 'warning.light',
  info: 'info.light',
};

const statusIconTextColors = {
  success: 'success.dark',
  error: 'error.dark',
  warning: 'warning.dark',
  info: 'info.dark',
};

export function Timeline({ items }: TimelineProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Timeline line */}
      <Box
        sx={{
          position: 'absolute',
          left: 16,
          top: 0,
          height: '100%',
          width: 2,
          bgcolor: 'divider',
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              position: 'relative',
              display: 'flex',
              gap: 2,
            }}
          >
            {/* Timeline dot/icon */}
            <Box sx={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
              {item.icon ? (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: item.status
                      ? statusIconBgColors[item.status]
                      : 'action.hover',
                    color: item.status
                      ? statusIconTextColors[item.status]
                      : 'text.secondary',
                    '& .MuiSvgIcon-root': {
                      fontSize: 18,
                    },
                  }}
                >
                  {item.icon}
                </Avatar>
              ) : (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 4,
                    borderColor: 'background.paper',
                    bgcolor: item.status
                      ? statusColors[item.status]
                      : 'grey.400',
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                pb: index === items.length - 1 ? 0 : 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 0.5, sm: 0 },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(item.timestamp)}
                </Typography>
              </Box>
              {item.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {item.description}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
