'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Spin } from 'antd';

import { MemberDashboard } from '@/components/dashboard';
import { useRouter } from '@/i18n/routing';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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
    router.push('/login?callbackUrl=/member');
    return null;
  }

  return (
    <MemberDashboard
      user={{
        name: session?.user?.name || 'Member',
        email: session?.user?.email || '',
        avatar: (session?.user as { image?: string })?.image || undefined,
      }}
      activeMenuKey={getActiveMenuKey()}
      onLogout={() => router.push('/login')}
    >
      {children}
    </MemberDashboard>
  );
}
