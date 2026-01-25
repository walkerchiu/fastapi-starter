'use client';

import { forwardRef, Children, isValidElement, cloneElement } from 'react';
import type { ReactNode, ReactElement } from 'react';
import type { AvatarSize, AvatarProps } from './Avatar';

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<
  AvatarSize,
  { avatar: string; overlap: string; counter: string }
> = {
  xs: {
    avatar: 'h-6 w-6 text-xs',
    overlap: '-ml-1.5',
    counter: 'h-6 w-6 text-xs',
  },
  sm: {
    avatar: 'h-8 w-8 text-sm',
    overlap: '-ml-2',
    counter: 'h-8 w-8 text-xs',
  },
  md: {
    avatar: 'h-10 w-10 text-base',
    overlap: '-ml-2.5',
    counter: 'h-10 w-10 text-sm',
  },
  lg: {
    avatar: 'h-12 w-12 text-lg',
    overlap: '-ml-3',
    counter: 'h-12 w-12 text-sm',
  },
  xl: {
    avatar: 'h-16 w-16 text-xl',
    overlap: '-ml-4',
    counter: 'h-16 w-16 text-base',
  },
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 4, size = 'md', className = '' }, ref) => {
    const childArray = Children.toArray(children).filter(isValidElement);
    const totalCount = childArray.length;
    const visibleCount = Math.min(totalCount, max);
    const extraCount = totalCount - visibleCount;

    const sizeStyle = sizeStyles[size];

    const visibleChildren = childArray.slice(0, visibleCount);

    return (
      <div ref={ref} className={`flex items-center ${className}`}>
        {visibleChildren.map((child, index) => {
          if (isValidElement<AvatarProps>(child)) {
            return cloneElement(child as ReactElement<AvatarProps>, {
              key: index,
              size,
              className:
                `${index > 0 ? sizeStyle.overlap : ''} ring-2 ring-white dark:ring-gray-900 ${child.props.className || ''}`.trim(),
            });
          }
          return child;
        })}
        {extraCount > 0 && (
          <div
            className={`${sizeStyle.overlap} ${sizeStyle.counter} inline-flex items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600 ring-2 ring-white dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-900`}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';
