'use client';

import { Result } from 'antd';

import { Button } from '@/components/ui';

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <Result
        status="403"
        title="Unauthorized"
        subTitle="You do not have permission to access this page."
        extra={
          <a href="/">
            <Button variant="primary">Go Home</Button>
          </a>
        }
      />
    </div>
  );
}
