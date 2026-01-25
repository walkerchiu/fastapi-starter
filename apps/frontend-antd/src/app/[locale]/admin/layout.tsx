'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Spin } from 'antd';

import { AdminDashboard } from '@/components/dashboard';
import { useRouter } from '@/i18n/routing';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const getActiveMenuKey = () => {
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/roles')) return 'roles';
    if (pathname.includes('/admin/permissions')) return 'permissions';
    if (pathname.includes('/admin/files')) return 'files';
    if (pathname.includes('/admin/settings')) return 'settings';
    if (pathname.includes('/admin/logs')) return 'logs';
    return 'dashboard';
  };

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin');
    return null;
  }

  return (
    <AdminDashboard
      user={{
        name: session?.user?.name || 'Admin',
        email: session?.user?.email || '',
        role: 'Administrator',
        avatar:
          (session?.user as { image?: string } | undefined)?.image || undefined,
      }}
      activeMenuKey={getActiveMenuKey()}
      onLogout={() => router.push('/login')}
    >
      {children}
    </AdminDashboard>
  );
}
