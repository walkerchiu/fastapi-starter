'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Typography, Form, Card } from 'antd';
import { MailOutlined } from '@ant-design/icons';

import { Alert, Button, Input } from '@/components/ui';
import { useForgotPassword } from '@/hooks/api';
import { Link } from '@/i18n/routing';

const { Title, Text, Link: AntLink } = Typography;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');

    try {
      await forgotPassword.mutateAsync({ email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  };

  if (success) {
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
          <Title level={3}>{t('successTitle')}</Title>
          <Text>{t('successMessage')}</Text>
          <div style={{ marginTop: 24 }}>
            <Link href="/login">
              <Button variant="primary">{t('backToLogin')}</Button>
            </Link>
          </div>
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={forgotPassword.isPending}
          >
            {forgotPassword.isPending ? t('submitting') : t('submit')}
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
