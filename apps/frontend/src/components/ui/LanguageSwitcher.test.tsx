import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageSwitcher } from './LanguageSwitcher';

const mockReplace = vi.fn();

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/dashboard',
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders language select', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox', { name: /select language/i });
    expect(select).toBeInTheDocument();
  });

  it('displays available language options', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');

    expect(options).toHaveLength(2);
    // Options show translation keys since useTranslations is mocked
    expect(options[0]).toHaveValue('en');
    expect(options[1]).toHaveValue('zh-TW');
  });

  it('calls router.replace when language is changed', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'zh-TW' } });

    expect(mockReplace).toHaveBeenCalledWith('/dashboard', { locale: 'zh-TW' });
  });

  it('has default value of en', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });
});
