'use client';

import { useEffect, useState } from 'react';
import { rootGet } from '@/lib/api';

export default function Home() {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await rootGet();
      if (response.error) {
        // Check if it's a network error (no response) or an API error
        if (!response.response) {
          setError(
            'Backend server is not running. Please start it with: pnpm dev:backend',
          );
        } else {
          setError('Failed to fetch data from API');
        }
        setMessage('');
      } else if (response.data) {
        setMessage(response.data['message'] ?? 'No message');
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {message}
        </h1>
      )}
    </main>
  );
}
