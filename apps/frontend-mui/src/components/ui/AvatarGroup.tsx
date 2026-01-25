'use client';

import { forwardRef, Children, isValidElement, cloneElement } from 'react';
import type { ReactNode, ReactElement } from 'react';
import MuiAvatarGroup from '@mui/material/AvatarGroup';
import type { AvatarSize, AvatarProps } from './Avatar';

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
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

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 4, size = 'md', className }, ref) => {
    const dimension = sizeMap[size];
    const childArray = Children.toArray(children).filter(isValidElement);

    const styledChildren = childArray.map((child, index) => {
      if (isValidElement<AvatarProps>(child)) {
        return cloneElement(child as ReactElement<AvatarProps>, {
          key: index,
          size,
        });
      }
      return child;
    });

    return (
      <MuiAvatarGroup
        ref={ref}
        max={max}
        className={className}
        sx={{
          '& .MuiAvatar-root': {
            width: dimension,
            height: dimension,
            fontSize: dimension * 0.4,
            borderWidth: 2,
          },
          '& .MuiAvatarGroup-avatar': {
            width: dimension,
            height: dimension,
            fontSize: dimension * 0.35,
          },
        }}
      >
        {styledChildren}
      </MuiAvatarGroup>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';
