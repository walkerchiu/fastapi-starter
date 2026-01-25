'use client';

import { Button, Dropdown } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTheme } from '@/theme';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, setMode, resolvedMode } = useTheme();

  const getIcon = () => {
    if (mode === 'system') {
      return <DesktopOutlined />;
    }
    return resolvedMode === 'dark' ? <MoonOutlined /> : <SunOutlined />;
  };

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: 'Light',
      icon: <SunOutlined />,
      onClick: () => setMode('light'),
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: <MoonOutlined />,
      onClick: () => setMode('dark'),
    },
    {
      key: 'system',
      label: 'System',
      icon: <DesktopOutlined />,
      onClick: () => setMode('system'),
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: [mode],
      }}
      trigger={['click']}
      className={className}
    >
      <Button type="text" icon={getIcon()} aria-label="Toggle theme" />
    </Dropdown>
  );
}
