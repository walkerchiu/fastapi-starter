'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Form } from 'antd';

import { Alert, Button, Input, Modal } from '@/components/ui';
import { useModalStore } from '@/stores';
import { useMe, useUpdateProfile } from '@/hooks/api';

interface UserProfile {
  name?: string;
  email?: string;
}

export function EditProfileModal() {
  const t = useTranslations('profile.modals.editProfile');
  const { isOpen, closeModal } = useModalStore();
  const open = isOpen('editProfile');
  const { data } = useMe();
  const user = data as UserProfile | undefined;
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async () => {
    setError('');
    try {
      await updateProfile.mutateAsync({ name });
      closeModal('editProfile');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  };

  const handleClose = () => {
    closeModal('editProfile');
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
            loading={updateProfile.isPending}
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

        <Form.Item label={t('name')}>
          <Input placeholder={t('name')} value={name} onChange={setName} />
        </Form.Item>

        <Form.Item label={t('email')}>
          <Input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={setEmail}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
