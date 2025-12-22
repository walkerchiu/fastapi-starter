import { fireEvent, render, screen } from '@testing-library/react';
import { signOut, useSession } from 'next-auth/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { ThemeProvider } from '@/components/providers/theme-provider';

import { Navbar } from './navbar';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

vi.mock('@/i18n', () => ({
  locales: ['en', 'zh-TW'],
  localeNames: {
    en: 'English',
    'zh-TW': '繁體中文',
  },
  defaultLocale: 'en',
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/test-path',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      dashboard: 'Dashboard',
      signIn: 'Sign in',
      signUp: 'Sign up',
      signOut: 'Sign out',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.matchMedia for ThemeProvider
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders loading state', () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<Navbar />, { wrapper: Wrapper });

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders sign in and sign up links when not authenticated', () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />, { wrapper: Wrapper });

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('renders user name and sign out button when authenticated', () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Navbar />, { wrapper: Wrapper });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it('renders dashboard link when authenticated', () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Navbar />, { wrapper: Wrapper });

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('renders user email when name is not available', () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Navbar />, { wrapper: Wrapper });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls signOut when sign out button is clicked', () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
        },
      },
      status: 'authenticated',
    });

    render(<Navbar />, { wrapper: Wrapper });

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('renders home link correctly', () => {
    (useSession as Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />, { wrapper: Wrapper });

    const homeLink = screen.getByRole('link', { name: 'home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
