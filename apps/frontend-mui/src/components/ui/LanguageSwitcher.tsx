'use client';

import { useLocale, useTranslations } from 'next-intl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import { usePathname, useRouter } from '@/i18n/routing';

const locales = ['en', 'zh-TW'] as const;
type Locale = (typeof locales)[number];

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <FormControl size="small">
      <Select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as Locale)}
        aria-label="Select language"
        sx={{
          minWidth: 100,
          '& .MuiSelect-select': {
            py: 1,
          },
        }}
      >
        {locales.map((loc) => (
          <MenuItem key={loc} value={loc}>
            {t(loc)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
