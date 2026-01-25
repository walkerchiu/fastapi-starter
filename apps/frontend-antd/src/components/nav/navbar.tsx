'use client';

import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import {
  Layout,
  Menu,
  Space,
  Avatar,
  Dropdown,
  Button as AntButton,
} from 'antd';
import {
  HomeOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useState } from 'react';

import { Button, ThemeToggle, LanguageSwitcher } from '@/components/ui';
import { Link, usePathname } from '@/i18n/routing';

const { Header } = Layout;

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">{t('home')}</Link>,
    },
    ...(isAuthenticated
      ? [
          {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: <Link href="/dashboard">{t('dashboard')}</Link>,
          },
        ]
      : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">{t('profile')}</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: () => signOut({ callbackUrl: '/login' }),
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>
          {t('brand')}
        </Link>

        {/* Desktop Navigation */}
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={navItems}
          style={{
            flex: 1,
            minWidth: 200,
            background: 'transparent',
            borderBottom: 'none',
          }}
        />
      </div>

      {/* Right Side */}
      <Space size="middle">
        <ThemeToggle />
        <LanguageSwitcher />

        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ color: '#fff' }}>
                {session?.user?.name || session?.user?.email}
              </span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <LoginOutlined /> {t('login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                {t('register')}
              </Button>
            </Link>
          </Space>
        )}

        {/* Mobile Menu Button */}
        <AntButton
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none' }}
          className="mobile-menu-button"
        />
      </Space>
    </Header>
  );
}
