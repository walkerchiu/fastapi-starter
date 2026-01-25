'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Typography, Form, Card, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';

import { Alert, Button, Input } from '@/components/ui';
import { useResetPassword } from '@/hooks/api';
import { Link, useRouter } from '@/i18n/routing';

const { Title, Text, Link: AntLink } = Typography;

function ResetPasswordForm() {
  const t = useTranslations('auth.resetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const resetPassword = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!token) {
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
          <Title level={3}>{t('invalidToken')}</Title>
          <Text>{t('invalidTokenMessage')}</Text>
          <div style={{ marginTop: 24 }}>
            <Link href="/forgot-password">
              <Button variant="primary">{t('requestNewLink')}</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      router.push('/login?reset=true');
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
          {t('subtitle')}
        </Text>

        <Form onFinish={handleSubmit} layout="vertical">
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <Form.Item label={t('password')} required>
            <Input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={setPassword}
              prefix={<LockOutlined />}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item label={t('confirmPassword')} required>
            <Input
              type="password"
              placeholder={t('confirmPassword')}
              value={confirmPassword}
              onChange={setConfirmPassword}
              prefix={<LockOutlined />}
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={resetPassword.isPending}
          >
            {resetPassword.isPending ? t('submitting') : t('submit')}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link href="/login">
              <AntLink>{t('backToLogin')}</AntLink>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
