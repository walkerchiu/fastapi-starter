'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Typography, Card, Spin, Result } from 'antd';

import { Button } from '@/components/ui';
import { useVerifyEmail } from '@/hooks/api';
import { Link } from '@/i18n/routing';

const { Title } = Typography;

function VerifyEmailContent() {
  const t = useTranslations('auth.verifyEmail');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const verifyEmail = useVerifyEmail();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    verifyEmail.mutate(
      { token },
      {
        onSuccess: () => setStatus('success'),
        onError: () => setStatus('error'),
      },
    );
  }, [token]);

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 24 }}>
            {t('verifying')}
          </Title>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
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
        <Card style={{ maxWidth: 400, width: '100%' }}>
          <Result
            status="success"
            title={t('successTitle')}
            subTitle={t('successMessage')}
            extra={
              <Link href="/login">
                <Button variant="primary">{t('goToLogin')}</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

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
      <Card style={{ maxWidth: 400, width: '100%' }}>
        <Result
          status="error"
          title={t('errorTitle')}
          subTitle={t('errorMessage')}
          extra={
            <Link href="/login">
              <Button variant="primary">{t('goToLogin')}</Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
