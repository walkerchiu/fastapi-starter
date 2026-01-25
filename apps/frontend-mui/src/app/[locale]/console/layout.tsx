'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

import { ConsoleDashboard } from '@/components/dashboard';
import { useRouter } from '@/i18n/routing';

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const getActiveMenuKey = () => {
    if (pathname.includes('/console/orders/pending')) return 'pending';
    if (pathname.includes('/console/orders/returns')) return 'returns';
    if (pathname.includes('/console/orders')) return 'orders';
    if (pathname.includes('/console/support/tickets')) return 'tickets';
    if (pathname.includes('/console/support/chat')) return 'chat';
    if (pathname.includes('/console/review/pending')) return 'pending-review';
    if (pathname.includes('/console/review/approved')) return 'approved';
    if (pathname.includes('/console/reports/sales')) return 'sales';
    if (pathname.includes('/console/reports/analytics')) return 'analytics';
    return 'dashboard';
  };

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress color="warning" />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/console');
    return null;
  }

  return (
    <ConsoleDashboard
      user={{
        name: session?.user?.name || 'Operator',
        email: session?.user?.email || '',
        role: 'Operations Manager',
        avatar: session?.user?.image || undefined,
      }}
      activeMenuKey={getActiveMenuKey()}
      onLogout={() => router.push('/login')}
    >
      {children}
    </ConsoleDashboard>
  );
}
