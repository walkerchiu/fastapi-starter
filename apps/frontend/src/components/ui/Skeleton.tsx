'use client';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-md',
};

const animationStyles: Record<'pulse' | 'wave' | 'none', string> = {
  pulse: 'animate-pulse',
  wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
  none: '',
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const defaultHeight = variant === 'text' ? '1em' : undefined;
  const defaultWidth = variant === 'circular' ? style.height : '100%';

  return (
    <div
      className={`bg-gray-200 ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={{
        ...style,
        width: style.width || defaultWidth,
        height: style.height || defaultHeight,
      }}
      aria-hidden="true"
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
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={lineHeight}
          width={index === lines - 1 ? '80%' : '100%'}
          animation={animation}
          className={index > 0 ? `mt-[${spacing}]` : ''}
        />
      ))}
    </div>
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
    <div
      className={`rounded-lg border border-gray-200 p-4 ${className}`}
      aria-hidden="true"
    >
      {showAvatar && (
        <div className="mb-4 flex items-center space-x-3">
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation={animation}
          />
          <div className="flex-1">
            {showTitle && (
              <Skeleton
                variant="text"
                width="60%"
                height="1.25em"
                animation={animation}
              />
            )}
          </div>
        </div>
      )}
      <SkeletonText lines={lines} animation={animation} />
    </div>
  );
}
