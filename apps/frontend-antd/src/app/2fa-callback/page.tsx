'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { signIn } from 'next-auth/react';

export default function TwoFactorCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    if (accessToken && refreshToken) {
      signIn('credentials', {
        accessToken,
        refreshToken,
        redirect: false,
      }).then((result) => {
        if (result?.error) {
          router.push('/login?error=auth');
        } else {
          router.push(callbackUrl);
        }
      });
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Spin size="large" />
    </div>
  );
}
