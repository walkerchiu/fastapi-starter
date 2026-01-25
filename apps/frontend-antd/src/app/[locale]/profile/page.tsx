'use client';

import { useTranslations } from 'next-intl';
import { Typography, Row, Col, Descriptions, Spin, Divider } from 'antd';
import {
  UserOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
} from '@ant-design/icons';

import { Button, Card } from '@/components/ui';
import { RequireRole } from '@/components/auth/RequireRole';
import { useMe } from '@/hooks/api';
import { useModalStore } from '@/stores';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { Disable2FAModal } from '@/components/profile/Disable2FAModal';
import { RegenerateBackupCodesModal } from '@/components/profile/RegenerateBackupCodesModal';
import { Link } from '@/i18n/routing';

const { Title, Text } = Typography;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

function ProfileContent() {
  const t = useTranslations('profile');
  const { data, isLoading } = useMe();
  const user = data as UserProfile | undefined;
  const { openModal } = useModalStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={2}>{t('title')}</Title>

        <Row gutter={[24, 24]}>
          {/* Profile Information */}
          <Col xs={24}>
            <Card
              title={
                <span>
                  <UserOutlined /> {t('sections.info')}
                </span>
              }
            >
              <Descriptions column={1}>
                <Descriptions.Item label={t('fields.name')}>
                  {user?.name || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('fields.email')}>
                  {user?.email || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('fields.verified')}>
                  {user?.isEmailVerified ? t('yes') : t('no')}
                </Descriptions.Item>
                <Descriptions.Item label={t('fields.createdAt')}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <Button
                variant="primary"
                onClick={() => openModal('editProfile')}
              >
                {t('actions.editProfile')}
              </Button>
            </Card>
          </Col>

          {/* Security */}
          <Col xs={24}>
            <Card
              title={
                <span>
                  <SafetyCertificateOutlined /> {t('sections.security')}
                </span>
              }
            >
              <Descriptions column={1}>
                <Descriptions.Item label={t('fields.twoFactor')}>
                  {user?.isTwoFactorEnabled ? (
                    <Text type="success">{t('enabled')}</Text>
                  ) : (
                    <Text type="warning">{t('disabled')}</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button
                  variant="outline"
                  onClick={() => openModal('changePassword')}
                >
                  <KeyOutlined /> {t('actions.changePassword')}
                </Button>
                {user?.isTwoFactorEnabled ? (
                  <>
                    <Button
                      variant="danger"
                      onClick={() => openModal('disable2FA')}
                    >
                      {t('actions.disable2FA')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openModal('regenerateBackupCodes')}
                    >
                      {t('actions.regenerateBackupCodes')}
                    </Button>
                  </>
                ) : (
                  <Link href="/2fa/setup">
                    <Button variant="primary">{t('actions.enable2FA')}</Button>
                  </Link>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Modals */}
        <EditProfileModal />
        <ChangePasswordModal />
        <Disable2FAModal />
        <RegenerateBackupCodesModal />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireRole roles={['user', 'admin', 'super_admin']}>
      <ProfileContent />
    </RequireRole>
  );
}
