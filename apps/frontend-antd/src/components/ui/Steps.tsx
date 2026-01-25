'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Steps as AntSteps } from 'antd';

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';
export type StepsDirection = 'horizontal' | 'vertical';
export type StepsSize = 'sm' | 'md' | 'lg';

export interface StepItem {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: StepStatus;
}

export interface StepsProps {
  items: StepItem[];
  current?: number;
  direction?: StepsDirection;
  size?: StepsSize;
  onChange?: (step: number) => void;
  clickable?: boolean;
  className?: string;
}

const sizeMap: Record<StepsSize, 'small' | 'default'> = {
  sm: 'small',
  md: 'default',
  lg: 'default',
};

const statusMap: Record<StepStatus, 'wait' | 'process' | 'finish' | 'error'> = {
  pending: 'wait',
  current: 'process',
  completed: 'finish',
  error: 'error',
};

export const Steps = forwardRef<HTMLDivElement, StepsProps>(
  (
    {
      items,
      current = 0,
      direction = 'horizontal',
      size = 'md',
      onChange,
      clickable = false,
      className,
    },
    ref,
  ) => {
    const getStepStatus = (
      index: number,
      item: StepItem,
    ): 'wait' | 'process' | 'finish' | 'error' => {
      if (item.status) return statusMap[item.status];
      if (index < current) return 'finish';
      if (index === current) return 'process';
      return 'wait';
    };

    const handleChange = (step: number) => {
      if (clickable && onChange) {
        onChange(step);
      }
    };

    const antItems = items.map((item, index) => ({
      title: item.title,
      description: item.description,
      icon: item.icon,
      status: getStepStatus(index, item),
    }));

    return (
      <div ref={ref} className={className}>
        <AntSteps
          current={current}
          direction={direction}
          size={sizeMap[size]}
          onChange={clickable ? handleChange : undefined}
          items={antItems}
          style={size === 'lg' ? { fontSize: '16px' } : undefined}
        />
      </div>
    );
  },
);

Steps.displayName = 'Steps';
