import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher';

// Mock locale state
let mockLocale = 'en';
const mockReplace = vi.fn();

vi.mock('next-intl', () => ({
  useLocale: () => mockLocale,
}));

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/test-path',
}));

vi.mock('@/i18n', () => ({
  locales: ['en', 'zh-TW'],
  localeNames: {
    en: 'English',
    'zh-TW': '繁體中文',
  },
  defaultLocale: 'en',
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockLocale = 'en';
    mockReplace.mockClear();
  });

  it('renders without crashing', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has correct aria-label for English locale', () => {
    mockLocale = 'en';
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'English');
  });

  it('has correct aria-label for Traditional Chinese locale', () => {
    mockLocale = 'zh-TW';
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      '繁體中文',
    );
  });

  it('displays EN for English locale', () => {
    mockLocale = 'en';
    render(<LanguageSwitcher />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('displays 繁 for Traditional Chinese locale', () => {
    mockLocale = 'zh-TW';
    render(<LanguageSwitcher />);
    expect(screen.getByText('繁')).toBeInTheDocument();
  });

  it('cycles from en to zh-TW on click', () => {
    mockLocale = 'en';
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/test-path', { locale: 'zh-TW' });
  });

  it('cycles from zh-TW to en on click', () => {
    mockLocale = 'zh-TW';
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/test-path', { locale: 'en' });
  });

  it('applies custom className', () => {
    render(<LanguageSwitcher className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('contains an SVG globe icon', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('has focus ring styles for accessibility', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-2');
  });
});
