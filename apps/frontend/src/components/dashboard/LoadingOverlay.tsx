'use client';

import { type ReactNode } from 'react';
import { Spinner } from '../ui/Spinner';

export interface LoadingOverlayProps {
  loading: boolean;
  children: ReactNode;
  text?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  loading,
  children,
  text,
  blur = true,
  className = '',
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {loading && (
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 ${blur ? 'backdrop-blur-sm' : ''}`}
        >
          <Spinner size="lg" />
          {text && (
            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              {text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
