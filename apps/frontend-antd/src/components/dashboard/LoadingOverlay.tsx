'use client';

import { type ReactNode } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface LoadingOverlayProps {
  loading: boolean;
  children: ReactNode;
  text?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  loading,
  children,
  text,
  blur = true,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={className} style={{ position: 'relative' }}>
      {children}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: blur ? 'blur(4px)' : undefined,
          }}
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
            size="large"
          />
          {text && (
            <p
              style={{
                marginTop: 12,
                fontSize: 14,
                fontWeight: 500,
                color: '#666',
              }}
            >
              {text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
