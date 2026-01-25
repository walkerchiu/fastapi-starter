'use client';

import { type ReactNode } from 'react';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export interface StatCardProps {
  title: string;
  value: ReactNode;
  valueClassName?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  valueClassName = '',
  className = '',
}: StatCardProps) {
  return (
    <MuiCard className={className} elevation={1}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="p"
          color="primary"
          fontWeight={700}
          className={valueClassName}
          sx={{ mt: 1 }}
        >
          {value}
        </Typography>
      </CardContent>
    </MuiCard>
  );
}
