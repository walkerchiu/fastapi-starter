'use client';

import { forwardRef } from 'react';
import MuiAvatar from '@mui/material/Avatar';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return (parts[0] ?? '').charAt(0).toUpperCase();
  }
  return (
    (parts[0] ?? '').charAt(0) + (parts[parts.length - 1] ?? '').charAt(0)
  ).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
    '#607d8b',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? '#607d8b';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', className }, ref) => {
    const dimension = sizeMap[size];
    const initials = name ? getInitials(name) : undefined;
    const bgColor = name ? getColorFromName(name) : undefined;

    return (
      <MuiAvatar
        ref={ref}
        src={src}
        alt={alt || name || 'Avatar'}
        className={className}
        sx={{
          width: dimension,
          height: dimension,
          fontSize: dimension * 0.4,
          bgcolor: !src && name ? bgColor : undefined,
        }}
      >
        {!src && initials}
      </MuiAvatar>
    );
  },
);

Avatar.displayName = 'Avatar';
