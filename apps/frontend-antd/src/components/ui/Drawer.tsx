'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Drawer as AntDrawer } from 'antd';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  size?: DrawerSize;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

const sizeMap: Record<DrawerPosition, Record<DrawerSize, number | string>> = {
  left: {
    sm: 256,
    md: 320,
    lg: 384,
    xl: 512,
    full: '100%',
  },
  right: {
    sm: 256,
    md: 320,
    lg: 384,
    xl: 512,
    full: '100%',
  },
  top: {
    sm: 128,
    md: 192,
    lg: 256,
    xl: 384,
    full: '100%',
  },
  bottom: {
    sm: 128,
    md: 192,
    lg: 256,
    xl: 384,
    full: '100%',
  },
};

const placementMap: Record<
  DrawerPosition,
  'left' | 'right' | 'top' | 'bottom'
> = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
};

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      isOpen,
      onClose,
      position = 'right',
      size = 'md',
      title,
      children,
      showCloseButton = true,
      className,
    },
    ref,
  ) => {
    const dimension = sizeMap[position][size];
    const isHorizontal = position === 'left' || position === 'right';

    return (
      <div ref={ref}>
        <AntDrawer
          open={isOpen}
          onClose={onClose}
          placement={placementMap[position]}
          title={title}
          closable={showCloseButton}
          width={isHorizontal ? dimension : undefined}
          height={!isHorizontal ? dimension : undefined}
          className={className}
        >
          {children}
        </AntDrawer>
      </div>
    );
  },
);

Drawer.displayName = 'Drawer';
