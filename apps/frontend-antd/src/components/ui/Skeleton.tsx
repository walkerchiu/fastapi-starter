import { Skeleton as AntSkeleton } from 'antd';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  active?: boolean;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  active = true,
  className,
}: SkeletonProps) {
  if (variant === 'circular') {
    return (
      <AntSkeleton.Avatar
        active={active}
        shape="circle"
        size={typeof width === 'number' ? width : 'default'}
        className={className}
        style={{ width, height }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <AntSkeleton.Image
        active={active}
        className={className}
        style={{ width, height }}
      />
    );
  }

  // text variant
  return (
    <AntSkeleton
      active={active}
      paragraph={false}
      title={{ width }}
      className={className}
    />
  );
}
