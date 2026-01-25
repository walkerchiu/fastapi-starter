'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Typography, Form, Spin, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

import { Alert, Button, Input } from '@/components/ui';
import { env } from '@/config/env';
import { Link, useRouter } from '@/i18n/routing';

const { Title, Text, Link: AntLink } = Typography;

function LoginForm() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      // First, check with backend if 2FA is required
      const loginResponse = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!loginResponse.ok) {
        const data = await loginResponse.json();
        setError(data.detail || t('invalidCredentials'));
        return;
      }

      const loginData = await loginResponse.json();

      // Check if 2FA is required
      if (loginData.requires_two_factor) {
        // Redirect to 2FA verification page
        router.push(
          `/2fa/verify?user_id=${loginData.user_id}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
        return;
      }

      // No 2FA required, proceed with NextAuth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
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
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          {t('title')}
        </Title>
        <Text
          style={{
            display: 'block',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {tCommon('or')}{' '}
          <Link href="/register">
            <AntLink>{t('noAccount')}</AntLink>
          </Link>
        </Text>

        <Form onFinish={handleSubmit} layout="vertical">
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <Form.Item label={t('email')} required>
            <Input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={setEmail}
              prefix={<MailOutlined />}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item label={t('password')} required>
            <Input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={setPassword}
              prefix={<LockOutlined />}
              autoComplete="current-password"
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Link href="/forgot-password">
              <AntLink>{t('forgotPassword')}</AntLink>
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={isLoading}>
            {isLoading ? t('submitting') : t('submit')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
