'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Typography, Form, Card, Steps, QRCode } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

import { Alert, Button, Input } from '@/components/ui';
import { RequireRole } from '@/components/auth/RequireRole';
import { useEnable2FA } from '@/hooks/api';
import { useRouter } from '@/i18n/routing';

const { Title, Text, Paragraph } = Typography;

function TwoFactorSetupContent() {
  const t = useTranslations('auth.twoFactor.setup');
  const router = useRouter();
  const enable2FA = useEnable2FA();
  const [step, setStep] = useState(0);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qr_code: string;
    backup_codes: string[];
  } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleStartSetup = async () => {
    setError('');
    try {
      const data = await enable2FA.mutateAsync();
      setSetupData(data);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  };

  const handleVerify = async () => {
    setError('');
    // In a real app, you would verify the code here
    // For now, we'll just proceed to the backup codes step
    if (code.length === 6) {
      setStep(2);
    } else {
      setError(t('invalidCode'));
    }
  };

  const handleComplete = () => {
    router.push('/profile');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Title level={2}>
          <SafetyCertificateOutlined /> {t('title')}
        </Title>

        <Steps
          current={step}
          items={[
            { title: t('steps.start') },
            { title: t('steps.scan') },
            { title: t('steps.backup') },
          ]}
          style={{ marginBottom: 32 }}
        />

        {step === 0 && (
          <Card>
            <Paragraph>{t('description')}</Paragraph>
            {error && (
              <div style={{ marginBottom: 16 }}>
                <Alert variant="error">{error}</Alert>
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleStartSetup}
              loading={enable2FA.isPending}
            >
              {t('startSetup')}
            </Button>
          </Card>
        )}

        {step === 1 && setupData && (
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <QRCode value={setupData.qr_code} size={200} />
            </div>
            <Paragraph>
              <Text strong>{t('manualEntry')}:</Text>
              <br />
              <Text code copyable>
                {setupData.secret}
              </Text>
            </Paragraph>
            <Form onFinish={handleVerify} layout="vertical">
              {error && (
                <div style={{ marginBottom: 16 }}>
                  <Alert variant="error">{error}</Alert>
                </div>
              )}
              <Form.Item label={t('verificationCode')} required>
                <Input
                  placeholder="000000"
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                />
              </Form.Item>
              <Button type="submit" variant="primary">
                {t('verify')}
              </Button>
            </Form>
          </Card>
        )}

        {step === 2 && setupData && (
          <Card>
            <Alert variant="warning" title={t('backupCodesWarning')}>
              {t('backupCodesDescription')}
            </Alert>
            <div
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                }}
              >
                {setupData.backup_codes.map((code, index) => (
                  <Text key={index} code>
                    {code}
                  </Text>
                ))}
              </div>
            </div>
            <Button variant="primary" onClick={handleComplete}>
              {t('complete')}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TwoFactorSetupPage() {
  return (
    <RequireRole roles={['user', 'admin', 'super_admin']}>
      <TwoFactorSetupContent />
    </RequireRole>
  );
}
