'use client';

import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

const languages = [
  { key: 'en', label: 'English' },
  { key: 'zh-TW', label: '繁體中文' },
];

export interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (key: string) => {
    router.replace(pathname, { locale: key });
  };

  const items: MenuProps['items'] = languages.map((lang) => ({
    key: lang.key,
    label: lang.label,
    onClick: () => handleLanguageChange(lang.key),
  }));

  const currentLanguage = languages.find((lang) => lang.key === locale);

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: [locale],
      }}
      trigger={['click']}
      className={className}
    >
      <Button type="text" icon={<GlobalOutlined />}>
        {currentLanguage?.label}
      </Button>
    </Dropdown>
  );
}
