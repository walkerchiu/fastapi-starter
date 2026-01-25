import { type ReactNode, type HTMLAttributes } from 'react';
import { Card as AntCard } from 'antd';

export interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({
  title,
  children,
  footer,
  className,
  hoverable = false,
  bordered = true,
}: CardProps) {
  return (
    <AntCard
      title={title}
      className={className}
      hoverable={hoverable}
      bordered={bordered}
      actions={footer ? [footer] : undefined}
    >
      {children}
    </AntCard>
  );
}

export function CardHeader({
  children,
  className = '',
  style,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={className}
      style={{
        borderBottom: '1px solid #f0f0f0',
        padding: '16px 24px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  style,
  ...props
}: CardBodyProps) {
  return (
    <div
      className={className}
      style={{
        padding: '24px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
