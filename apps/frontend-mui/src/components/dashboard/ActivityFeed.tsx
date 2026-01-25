import { type ReactNode } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Skeleton,
  Divider,
} from '@mui/material';

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date | string;
  icon?: ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function ActivityItemSkeleton() {
  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Skeleton variant="circular" width={40} height={40} />
      </ListItemAvatar>
      <ListItemText
        primary={<Skeleton width="60%" />}
        secondary={<Skeleton width="30%" />}
      />
    </ListItem>
  );
}

export function ActivityFeed({
  items,
  loading = false,
  emptyText = 'No recent activity',
}: ActivityFeedProps) {
  if (loading) {
    return (
      <List disablePadding>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index}>
            <ActivityItemSkeleton />
            {index < 4 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {items.map((item, index) => (
        <Box key={item.id}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              {item.icon ? (
                <Avatar
                  sx={{ bgcolor: 'action.hover', color: 'text.secondary' }}
                >
                  {item.icon}
                </Avatar>
              ) : (
                <Avatar src={item.user.avatar} alt={item.user.name}>
                  {item.user.name.charAt(0)}
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" component="span">
                  <Typography component="span" fontWeight="medium">
                    {item.user.name}
                  </Typography>{' '}
                  <Typography component="span" color="text.secondary">
                    {item.action}
                  </Typography>
                  {item.target && (
                    <>
                      {' '}
                      <Typography component="span" fontWeight="medium">
                        {item.target}
                      </Typography>
                    </>
                  )}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(item.timestamp)}
                </Typography>
              }
            />
          </ListItem>
          {index < items.length - 1 && (
            <Divider variant="inset" component="li" />
          )}
        </Box>
      ))}
    </List>
  );
}
