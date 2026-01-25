'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Form } from 'antd';

import { Alert, Button, Input, Modal } from '@/components/ui';
import { useModalStore } from '@/stores';
import { useChangePassword } from '@/hooks/api';

export function ChangePasswordModal() {
  const t = useTranslations('profile.modals.changePassword');
  const { isOpen, closeModal } = useModalStore();
  const open = isOpen('changePassword');
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  };

  const handleClose = () => {
    closeModal('changePassword');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('title')}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={changePassword.isPending}
          >
            {t('save')}
          </Button>
        </div>
      }
    >
      <Form layout="vertical">
        {error && (
          <div style={{ marginBottom: 16 }}>
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <Form.Item label={t('currentPassword')} required>
          <Input
            type="password"
            placeholder={t('currentPassword')}
            value={currentPassword}
            onChange={setCurrentPassword}
          />
        </Form.Item>

        <Form.Item label={t('newPassword')} required>
          <Input
            type="password"
            placeholder={t('newPassword')}
            value={newPassword}
            onChange={setNewPassword}
          />
        </Form.Item>

        <Form.Item label={t('confirmPassword')} required>
          <Input
            type="password"
            placeholder={t('confirmPassword')}
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
