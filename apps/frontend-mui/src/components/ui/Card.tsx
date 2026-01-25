'use client';

import { type ReactNode } from 'react';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

export interface CardProps {
  children: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function Card({
  children,
  className = '',
  sx,
  'data-testid': testId,
}: CardProps) {
  return (
    <MuiCard className={className} elevation={1} sx={sx} data-testid={testId}>
      {children}
    </MuiCard>
  );
}

export function CardHeader({
  children,
  className = '',
  'data-testid': testId,
}: CardHeaderProps) {
  return (
    <>
      <Box sx={{ px: 3, py: 2 }} className={className} data-testid={testId}>
        {children}
      </Box>
      <Divider />
    </>
  );
}

export function CardBody({
  children,
  className = '',
  'data-testid': testId,
}: CardBodyProps) {
  return (
    <CardContent className={className} data-testid={testId}>
      {children}
    </CardContent>
  );
}
