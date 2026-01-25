'use client';

import { forwardRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

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

const sizeStyles: Record<DrawerPosition, Record<DrawerSize, string>> = {
  left: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[32rem]',
    full: 'w-full',
  },
  right: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[32rem]',
    full: 'w-full',
  },
  top: {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-96',
    full: 'h-full',
  },
  bottom: {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-96',
    full: 'h-full',
  },
};

const positionStyles: Record<
  DrawerPosition,
  { container: string; open: string; closed: string }
> = {
  left: {
    container: 'inset-y-0 left-0',
    open: 'translate-x-0',
    closed: '-translate-x-full',
  },
  right: {
    container: 'inset-y-0 right-0',
    open: 'translate-x-0',
    closed: 'translate-x-full',
  },
  top: {
    container: 'inset-x-0 top-0',
    open: 'translate-y-0',
    closed: '-translate-y-full',
  },
  bottom: {
    container: 'inset-x-0 bottom-0',
    open: 'translate-y-0',
    closed: 'translate-y-full',
  },
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
      className = '',
    },
    ref,
  ) => {
    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      },
      [isOpen, onClose],
    );

    useEffect(() => {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [handleEscape]);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    const positionStyle = positionStyles[position];
    const sizeStyle = sizeStyles[position][size];

    const isHorizontal = position === 'left' || position === 'right';

    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
          className={`fixed z-50 ${positionStyle.container} ${sizeStyle} ${
            isHorizontal ? 'h-full' : 'w-full'
          } transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
            isOpen ? positionStyle.open : positionStyle.closed
          } ${className}`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              {title && (
                <h2
                  id="drawer-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Close drawer"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </>
    );
  },
);

Drawer.displayName = 'Drawer';
