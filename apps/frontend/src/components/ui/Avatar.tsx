'use client';

import { forwardRef, useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
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
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? 'bg-gray-500';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', className = '' }, ref) => {
    const [imageError, setImageError] = useState(false);
    const showImage = src && !imageError;
    const showInitials = !showImage && name;

    const baseStyles =
      'inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0';

    const fallbackStyles =
      'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300';

    const combinedClassName = [
      baseStyles,
      sizeStyles[size],
      !showImage && showInitials ? getColorFromName(name) : '',
      !showImage && !showInitials ? fallbackStyles : '',
      showInitials ? 'text-white font-medium' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedClassName}>
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : showInitials ? (
          <span aria-label={name}>{getInitials(name)}</span>
        ) : (
          <svg
            className="h-full w-full text-gray-400 dark:text-gray-500"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
