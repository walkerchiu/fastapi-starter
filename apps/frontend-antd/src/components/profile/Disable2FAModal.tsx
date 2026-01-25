'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Form } from 'antd';

import { Alert, Button, Input, Modal } from '@/components/ui';
import { useModalStore } from '@/stores';
import { useDisable2FA } from '@/hooks/api';

export function Disable2FAModal() {
  const t = useTranslations('profile.modals.disable2FA');
  const { isOpen, closeModal } = useModalStore();
  const open = isOpen('disable2FA');
  const disable2FA = useDisable2FA();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    try {
      await disable2FA.mutateAsync({ code });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  };

  const handleClose = () => {
    closeModal('disable2FA');
    setCode('');
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
            variant="danger"
            onClick={handleSubmit}
            loading={disable2FA.isPending}
          >
            {t('disable')}
          </Button>
        </div>
      }
    >
      <Form layout="vertical">
        <Alert variant="warning" title={t('warning')}>
          {t('warningMessage')}
        </Alert>

        {error && (
          <div style={{ marginTop: 16 }}>
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <Form.Item label={t('code')} required style={{ marginTop: 16 }}>
          <Input
            placeholder="000000"
            value={code}
            onChange={setCode}
            maxLength={6}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
