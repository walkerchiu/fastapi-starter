'use client';

import { forwardRef, Children, isValidElement, cloneElement } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { Avatar as AntAvatar } from 'antd';
import type { AvatarSize, AvatarProps } from './Avatar';

const { Group: AntAvatarGroup } = AntAvatar;

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
      <div ref={ref} className={className}>
        <AntAvatarGroup
          max={{
            count: max,
            style: {
              backgroundColor: '#e5e7eb',
              color: '#4b5563',
              width: dimension,
              height: dimension,
              fontSize: dimension * 0.35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          size={dimension}
        >
          {styledChildren}
        </AntAvatarGroup>
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';
