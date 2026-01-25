import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageSwitcher } from './LanguageSwitcher';

const mockReplace = vi.fn();

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/dashboard',
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      en: 'English',
      'zh-TW': '繁體中文',
    };
    return translations[key] || key;
  },
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders language select', () => {
    render(<LanguageSwitcher />);

    // MUI Select uses combobox role
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('displays available language options when opened', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    // MUI renders options in a portal with role="option"
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
    });
  });

  it('calls router.replace when language is changed', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    // Find and click the zh-TW option
    const zhTWOption = await screen.findByRole('option', { name: /繁體中文/i });
    await user.click(zhTWOption);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard', { locale: 'zh-TW' });
  });

  it('has default value of en', () => {
    render(<LanguageSwitcher />);

    // MUI Select displays the selected value in the button text
    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('English');
  });
});
