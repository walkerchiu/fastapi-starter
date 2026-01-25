'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
        const data = response.data as { message?: string };
        setMessage(data.message ?? t('noMessage'));
      }
      setIsLoading(false);
    };

    fetchData();
  }, [t]);

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isLoading ? (
        <Typography variant="h3" component="h1" fontWeight="bold">
          {t('loading')}
        </Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Typography variant="h3" component="h1" fontWeight="bold">
          {message}
        </Typography>
      )}
    </Box>
  );
}
