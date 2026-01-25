import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

// Mock @/i18n/routing
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/',
}));

import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders language switcher', () => {
    render(<LanguageSwitcher />);
    // Ant Design Dropdown uses a button as trigger
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays current language', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });
});
