'use client';

import { Box, Container, Divider, Paper, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';

import { ChangePasswordModal, EditProfileModal } from '@/components/profile';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  Spinner,
} from '@/components/ui';
import { env } from '@/config/env';
import { MeDocument } from '@/graphql/generated/graphql';
import { useRouter } from '@/i18n/routing';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { data: session, status } = useSession();
  const router = useRouter();

  const [meResult, reexecuteQuery] = useQuery({
    query: MeDocument,
    pause: status !== 'authenticated',
  });

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 2FA disable modal state
  const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');
  const [disable2FAError, setDisable2FAError] = useState('');
  const [isDisable2FALoading, setIsDisable2FALoading] = useState(false);

  // Backup codes modal state
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesError, setBackupCodesError] = useState('');
  const [isBackupCodesLoading, setIsBackupCodesLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  const handleEditSuccess = () => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisable2FAError('');
    setIsDisable2FALoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/disable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ password: disable2FAPassword }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('disable2FAFailed'));
      }

      setIsDisable2FAModalOpen(false);
      setDisable2FAPassword('');
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (err) {
      if (err instanceof Error) {
        setDisable2FAError(err.message);
      } else {
        setDisable2FAError(t('genericError'));
      }
    } finally {
      setIsDisable2FALoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setBackupCodesError('');
    setIsBackupCodesLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/backup-codes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('regenerateBackupCodesFailed'));
      }

      const data = await response.json();
      setBackupCodes(data.backup_codes);
      setIsBackupCodesModalOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        setBackupCodesError(err.message);
      } else {
        setBackupCodesError(t('genericError'));
      }
    } finally {
      setIsBackupCodesLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  const openDisable2FAModal = () => {
    setDisable2FAPassword('');
    setDisable2FAError('');
    setIsDisable2FAModalOpen(true);
  };

  if (status === 'loading' || meResult.fetching) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const user = meResult.data?.me;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      {meResult.error && (
        <Box sx={{ mb: 3 }}>
          <Alert variant="error">{meResult.error.message}</Alert>
        </Box>
      )}

      <Card sx={{ mb: 3 }}>
        <CardHeader>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" color="text.primary">
              {t('userInformation')}
            </Typography>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              {t('edit')}
            </Button>
          </Box>
        </CardHeader>
        <CardBody>
          <Box>
            <Box
              sx={{
                py: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                color="text.secondary"
                sx={{ width: { sm: '33%' } }}
              >
                {t('name')}
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
                {user?.name || '-'}
              </Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                py: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                color="text.secondary"
                sx={{ width: { sm: '33%' } }}
              >
                {t('email')}
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                py: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
              }}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                color="text.secondary"
                sx={{ width: { sm: '33%' } }}
              >
                {t('status')}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Badge variant={user?.isActive ? 'success' : 'error'}>
                  {user?.isActive ? t('active') : t('inactive')}
                </Badge>
              </Box>
            </Box>
            <Divider />
            <Box
              sx={{
                py: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                color="text.secondary"
                sx={{ width: { sm: '33%' } }}
              >
                {t('memberSince')}
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '-'}
              </Typography>
            </Box>
          </Box>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Typography variant="h6" color="text.primary">
            {t('security')}
          </Typography>
        </CardHeader>
        <CardBody>
          <Box>
            <Box
              sx={{
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color="text.primary"
                >
                  {t('password')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('changePasswordDescription')}
                </Typography>
              </Box>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                {t('change')}
              </Button>
            </Box>

            <Divider />

            <Box sx={{ py: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                    >
                      {t('twoFactorAuth')}
                    </Typography>
                    <Badge
                      variant={user?.isTwoFactorEnabled ? 'success' : 'neutral'}
                    >
                      {user?.isTwoFactorEnabled ? t('enabled') : t('disabled')}
                    </Badge>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('twoFactorAuthDescription')}
                  </Typography>
                </Box>
                {user?.isTwoFactorEnabled ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openDisable2FAModal}
                  >
                    {t('disable')}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/2fa/setup')}
                  >
                    {t('enable')}
                  </Button>
                )}
              </Box>

              {user?.isTwoFactorEnabled && (
                <Paper
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color="text.primary"
                      >
                        {t('backupCodes')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('backupCodesDescription')}
                      </Typography>
                    </Box>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRegenerateBackupCodes}
                      loading={isBackupCodesLoading}
                    >
                      {t('regenerate')}
                    </Button>
                  </Box>
                  {backupCodesError && (
                    <Box sx={{ mt: 1 }}>
                      <Alert variant="error">{backupCodesError}</Alert>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={user?.name || ''}
        onSuccess={handleEditSuccess}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Disable 2FA Modal */}
      <Modal
        isOpen={isDisable2FAModalOpen}
        onClose={() => setIsDisable2FAModalOpen(false)}
        title={t('disable2FATitle')}
      >
        <Box component="form" onSubmit={handleDisable2FA}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('disable2FADescription')}
          </Typography>
          {disable2FAError && (
            <Box sx={{ mb: 2 }}>
              <Alert variant="error">{disable2FAError}</Alert>
            </Box>
          )}
          <Box sx={{ mb: 2 }}>
            <Typography
              component="label"
              htmlFor="disable2FAPassword"
              variant="body2"
              fontWeight="medium"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {t('password')}
            </Typography>
            <Input
              type="password"
              id="disable2FAPassword"
              value={disable2FAPassword}
              onChange={(e) => setDisable2FAPassword(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDisable2FAModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" loading={isDisable2FALoading}>
              {t('disable2FA')}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={isBackupCodesModalOpen}
        onClose={() => setIsBackupCodesModalOpen(false)}
        title={t('newBackupCodesTitle')}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert variant="warning">{t('backupCodesWarning')}</Alert>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
            }}
          >
            {backupCodes.map((code, index) => (
              <Box
                key={index}
                component="code"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              >
                {code}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="secondary" onClick={handleCopyBackupCodes}>
              {t('copyAll')}
            </Button>
            <Button onClick={() => setIsBackupCodesModalOpen(false)}>
              {t('done')}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}
