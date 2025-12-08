import { type HTMLAttributes, type ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white shadow ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`border-b border-gray-200 px-6 py-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  ...props
}: CardBodyProps) {
  return (
    <div className={`p-6 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
