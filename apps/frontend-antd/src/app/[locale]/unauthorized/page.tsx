'use client';

import { useTranslations } from 'next-intl';
import { Result } from 'antd';

import { Button } from '@/components/ui';
import { Link } from '@/i18n/routing';

export default function UnauthorizedPage() {
  const t = useTranslations('errors.unauthorized');

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
      <Result
        status="403"
        title={t('title')}
        subTitle={t('message')}
        extra={
          <Link href="/">
            <Button variant="primary">{t('goHome')}</Button>
          </Link>
        }
      />
    </div>
  );
}
