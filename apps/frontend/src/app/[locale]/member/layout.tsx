'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import { MemberDashboard } from '@/components/dashboard';
import { useRouter } from '@/i18n/routing';
import { Spinner } from '@/components/ui';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Extract active menu key from pathname
  const getActiveMenuKey = () => {
    if (pathname.includes('/member/profile')) return 'profile';
    if (pathname.includes('/member/security')) return 'security';
    if (pathname.includes('/member/notifications')) return 'notifications';
    if (pathname.includes('/member/activity')) return 'activity';
    if (pathname.includes('/member/sessions')) return 'sessions';
    return 'overview';
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/member');
    return null;
  }

  return (
    <MemberDashboard
      user={{
        name: session?.user?.name || 'Member',
        email: session?.user?.email || '',
        avatar: session?.user?.image || undefined,
      }}
      activeMenuKey={getActiveMenuKey()}
      onLogout={() => router.push('/login')}
    >
      {children}
    </MemberDashboard>
  );
}
