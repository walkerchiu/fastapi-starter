'use client';

import { type ReactNode } from 'react';
import { Divider, Space } from 'antd';

export interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  className?: string;
}

export function FormActions({
  children,
  align = 'right',
  sticky = false,
  className,
}: FormActionsProps) {
  const alignmentStyles = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div
      className={className}
      style={{
        ...(sticky && {
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#fff',
          padding: '16px 0',
          zIndex: 10,
        }),
      }}
    >
      <Divider style={{ margin: '24px 0 16px 0' }} />
      <Space
        size={12}
        style={{
          display: 'flex',
          justifyContent: alignmentStyles[align],
          width: '100%',
        }}
      >
        {children}
      </Space>
    </div>
  );
}
