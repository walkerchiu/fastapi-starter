'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import { AdminDashboard } from '@/components/dashboard';
import { useRouter } from '@/i18n/routing';
import { Spinner } from '@/components/ui';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Extract active menu key from pathname
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
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
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
        avatar: session?.user?.image || undefined,
      }}
      activeMenuKey={getActiveMenuKey()}
      onLogout={() => router.push('/login')}
    >
      {children}
    </AdminDashboard>
  );
}
