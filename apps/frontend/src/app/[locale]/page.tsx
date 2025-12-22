'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { rootGet } from '@/lib/api';

export default function Home() {
  const t = useTranslations('home');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await rootGet();
      if (response.error) {
        setError(t('error'));
        setMessage('');
      } else if (response.data) {
        setMessage(response.data['message'] ?? t('noMessage'));
      }
      setIsLoading(false);
    };

    fetchData();
  }, [t]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {isLoading ? (
        <h1 className="text-4xl font-bold">{t('loading')}</h1>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <h1 className="text-4xl font-bold">{message}</h1>
      )}
    </main>
  );
}
