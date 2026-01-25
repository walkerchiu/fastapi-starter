'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Typography, Form, Card, Spin } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

import { Alert, Button, Input } from '@/components/ui';
import { useVerify2FA } from '@/hooks/api';
import { useRouter } from '@/i18n/routing';

const { Title, Paragraph } = Typography;

function TwoFactorVerifyContent() {
  const t = useTranslations('auth.twoFactor.verify');
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const verify2FA = useVerify2FA();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!userId) {
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
        <Card style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <Title level={3}>{t('invalidSession')}</Title>
          <Paragraph>{t('invalidSessionMessage')}</Paragraph>
          <Button variant="primary" onClick={() => router.push('/login')}>
            {t('backToLogin')}
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');

    try {
      const data = await verify2FA.mutateAsync({ user_id: userId, code });

      // Sign in with the tokens received
      const result = await signIn('credentials', {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        redirect: false,
      });

      if (result?.error) {
        setError(t('verificationFailed'));
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  };

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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyCertificateOutlined
            style={{ fontSize: 48, color: '#4f46e5' }}
          />
          <Title level={3} style={{ marginTop: 16 }}>
            {t('title')}
          </Title>
          <Paragraph>{t('description')}</Paragraph>
        </div>

        <Form onFinish={handleSubmit} layout="vertical">
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <Form.Item label={t('code')} required>
            <Input
              placeholder="000000"
              value={code}
              onChange={setCode}
              maxLength={6}
              autoFocus
            />
          </Form.Item>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={verify2FA.isPending}
          >
            {verify2FA.isPending ? t('verifying') : t('verify')}
          </Button>

          <Paragraph
            style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}
          >
            {t('backupCodeHint')}
          </Paragraph>
        </Form>
      </Card>
    </div>
  );
}

export default function TwoFactorVerifyPage() {
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
      <TwoFactorVerifyContent />
    </Suspense>
  );
}
