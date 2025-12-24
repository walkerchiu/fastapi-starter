import '@testing-library/jest-dom';
import * as React from 'react';
import { vi, expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Extend Vitest with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock next-intl/navigation
vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    return React.createElement('a', { href, ...props }, children);
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));
