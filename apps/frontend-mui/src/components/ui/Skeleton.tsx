'use client';

import MuiSkeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const animationMap: Record<
  'pulse' | 'wave' | 'none',
  'pulse' | 'wave' | false
> = {
  pulse: 'pulse',
  wave: 'wave',
  none: false,
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <MuiSkeleton
      variant={variant}
      width={width}
      height={height}
      animation={animationMap[animation]}
      className={className}
      data-testid="skeleton"
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: string | number;
  spacing?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function SkeletonText({
  lines = 3,
  lineHeight = '1em',
  spacing = '0.5em',
  className = '',
  animation = 'pulse',
}: SkeletonTextProps) {
  const spacingValue = typeof spacing === 'number' ? `${spacing}px` : spacing;

  return (
    <Box className={className} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Box key={index} sx={{ mt: index > 0 ? spacingValue : undefined }}>
          <Skeleton
            variant="text"
            height={lineHeight}
            width={index === lines - 1 ? '80%' : '100%'}
            animation={animation}
          />
        </Box>
      ))}
    </Box>
  );
}

export interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  lines?: number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function SkeletonCard({
  showAvatar = true,
  showTitle = true,
  lines = 3,
  className = '',
  animation = 'pulse',
}: SkeletonCardProps) {
  return (
    <Box
      className={className}
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
      aria-hidden="true"
    >
      {showAvatar && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation={animation}
          />
          <Box sx={{ flex: 1 }}>
            {showTitle && (
              <Skeleton
                variant="text"
                width="60%"
                height="1.25em"
                animation={animation}
              />
            )}
          </Box>
        </Box>
      )}
      <SkeletonText lines={lines} animation={animation} />
    </Box>
  );
}
