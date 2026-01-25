import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Avatar,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface StatItem {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  href?: string;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

function StatCard({ stat }: { stat: StatItem }) {
  const content = (
    <Card
      sx={{
        height: '100%',
        transition: 'box-shadow 0.2s',
        '&:hover': stat.href ? { boxShadow: 3 } : undefined,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {stat.title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {stat.value}
            </Typography>
            {stat.change && (
              <Box
                sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={
                    stat.change.trend === 'up' ? 'success.main' : 'error.main'
                  }
                >
                  {stat.change.trend === 'up' ? '+' : '-'}
                  {Math.abs(stat.change.value)}%
                </Typography>
                {stat.change.trend === 'up' ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
              </Box>
            )}
          </Box>
          {stat.icon && (
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.light',
                color: 'primary.main',
              }}
            >
              {stat.icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (stat.href) {
    return (
      <Link
        href={stat.href}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        {content}
      </Link>
    );
  }

  return content;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton width={96} height={20} />
            <Skeleton width={80} height={40} sx={{ mt: 1 }} />
            <Skeleton width={64} height={20} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="circular" width={48} height={48} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function StatsGrid({
  stats,
  columns = 4,
  loading = false,
}: StatsGridProps) {
  const gridColumns = {
    2: { xs: 12, sm: 6 },
    3: { xs: 12, sm: 6, lg: 4 },
    4: { xs: 12, sm: 6, lg: 3 },
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: columns }).map((_, index) => (
          <Grid item key={index} {...gridColumns[columns]}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid item key={stat.title + index} {...gridColumns[columns]}>
          <StatCard stat={stat} />
        </Grid>
      ))}
    </Grid>
  );
}
