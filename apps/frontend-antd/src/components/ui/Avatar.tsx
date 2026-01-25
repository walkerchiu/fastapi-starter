'use client';

import { forwardRef } from 'react';
import { Avatar as AntAvatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

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
  const parts = name.trim().split(/\s+/);
  const firstPart = parts[0] ?? '';
  if (parts.length === 1) {
    return firstPart.charAt(0).toUpperCase();
  }
  const lastPart = parts[parts.length - 1] ?? '';
  return (firstPart.charAt(0) + lastPart.charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#f5222d',
    '#fa541c',
    '#fa8c16',
    '#faad14',
    '#a0d911',
    '#52c41a',
    '#13c2c2',
    '#1890ff',
    '#2f54eb',
    '#722ed1',
    '#eb2f96',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? '#7265e6';
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, name, size = 'md', className }, ref) => {
    const dimension = sizeMap[size];
    const initials = name ? getInitials(name) : undefined;
    const bgColor = name ? getColorFromName(name) : undefined;

    return (
      <AntAvatar
        ref={ref}
        src={src}
        alt={alt || name || 'Avatar'}
        size={dimension}
        className={className}
        style={{
          backgroundColor: !src && name ? bgColor : undefined,
        }}
        icon={!src && !name ? <UserOutlined /> : undefined}
      >
        {!src && initials}
      </AntAvatar>
    );
  },
);

Avatar.displayName = 'Avatar';
