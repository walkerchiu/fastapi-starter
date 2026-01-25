'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Typography, Form, Card } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

import { Alert, Button, Input } from '@/components/ui';
import { useRegister } from '@/hooks/api';
import { Link, useRouter } from '@/i18n/routing';

const { Title, Text, Link: AntLink } = Typography;

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    try {
      await register.mutateAsync({ name, email, password });
      router.push('/login?registered=true');
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
          {tCommon('or')}{' '}
          <Link href="/login">
            <AntLink>{t('hasAccount')}</AntLink>
          </Link>
        </Text>

        <Form onFinish={handleSubmit} layout="vertical">
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <Form.Item label={t('name')} required>
            <Input
              placeholder={t('name')}
              value={name}
              onChange={setName}
              prefix={<UserOutlined />}
              autoComplete="name"
            />
          </Form.Item>

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
            loading={register.isPending}
          >
            {register.isPending ? t('submitting') : t('submit')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
