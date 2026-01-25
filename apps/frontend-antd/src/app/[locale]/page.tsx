'use client';

import { useTranslations } from 'next-intl';
import { Typography, Space, Row, Col } from 'antd';
import {
  RocketOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
} from '@ant-design/icons';

import { Button, Card } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const t = useTranslations('home');
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#4f46e5' }} />,
      title: t('features.fast.title'),
      description: t('features.fast.description'),
    },
    {
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 32, color: '#4f46e5' }} />
      ),
      title: t('features.secure.title'),
      description: t('features.secure.description'),
    },
    {
      icon: <ApiOutlined style={{ fontSize: 32, color: '#4f46e5' }} />,
      title: t('features.api.title'),
      description: t('features.api.description'),
    },
  ];

  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <Title level={1}>{t('title')}</Title>
          <Paragraph
            style={{
              fontSize: 18,
              maxWidth: 600,
              margin: '0 auto 32px',
            }}
          >
            {t('subtitle')}
          </Paragraph>
          <Space size="middle">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  {t('cta.dashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button variant="primary" size="lg">
                    {t('cta.getStarted')}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    {t('cta.signIn')}
                  </Button>
                </Link>
              </>
            )}
          </Space>
        </div>

        {/* Features Section */}
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className="h-full" hoverable>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph>{feature.description}</Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
