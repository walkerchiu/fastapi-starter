import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: sizeMap[size] }} spin />}
      className={className}
    />
  );
}
