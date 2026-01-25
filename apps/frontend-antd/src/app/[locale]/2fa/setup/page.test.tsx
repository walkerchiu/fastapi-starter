import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock RequireRole to just render children
vi.mock('@/components/auth/RequireRole', () => ({
  RequireRole: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useEnable2FA
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/api', () => ({
  useEnable2FA: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Mock useRouter
const mockPush = vi.fn();
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Set Up Two-Factor Authentication',
      description: 'Add an extra layer of security',
      'steps.start': 'Start',
      'steps.scan': 'Scan',
      'steps.backup': 'Backup',
      startSetup: 'Start Setup',
      manualEntry: 'Manual Entry',
      verificationCode: 'Verification Code',
      verify: 'Verify',
      invalidCode: 'Invalid code',
      backupCodesWarning: 'Save Your Backup Codes',
      backupCodesDescription: 'Store these codes safely',
      complete: 'Complete',
      genericError: 'An error occurred',
    };
    return translations[key] ?? key;
  },
}));

import TwoFactorSetupPage from './page';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe('TwoFactorSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the setup page', async () => {
    renderWithProviders(<TwoFactorSetupPage />);

    expect(
      screen.getByText('Set Up Two-Factor Authentication'),
    ).toBeInTheDocument();
    expect(screen.getByText('Start Setup')).toBeInTheDocument();
  });

  it('starts setup when button is clicked', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      secret: 'TESTSECRET',
      qr_code: 'otpauth://totp/test',
      backup_codes: ['code1', 'code2'],
    });

    renderWithProviders(<TwoFactorSetupPage />);

    const startButton = screen.getByText('Start Setup');
    await act(async () => {
      fireEvent.click(startButton);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('shows error when setup fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Setup failed'));

    renderWithProviders(<TwoFactorSetupPage />);

    const startButton = screen.getByText('Start Setup');
    await act(async () => {
      fireEvent.click(startButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Setup failed')).toBeInTheDocument();
    });
  });
});
