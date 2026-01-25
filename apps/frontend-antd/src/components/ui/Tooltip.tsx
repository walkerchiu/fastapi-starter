import { type ReactNode } from 'react';
import { Tooltip as AntTooltip } from 'antd';

export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  trigger?: 'hover' | 'focus' | 'click';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  trigger = 'hover',
  open,
  onOpenChange,
  className,
}: TooltipProps) {
  return (
    <AntTooltip
      title={content}
      placement={placement}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      className={className}
    >
      <span>{children}</span>
    </AntTooltip>
  );
}
