import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RegenerateBackupCodesModal } from './RegenerateBackupCodesModal';
import { useModalStore } from '@/stores';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Regenerate Backup Codes',
      warning: 'Warning',
      warningMessage: 'This will invalidate all your existing backup codes.',
      code: 'Enter 2FA code',
      cancel: 'Cancel',
      regenerate: 'Regenerate',
      done: 'Done',
      saveCodesWarning: 'Save these codes',
      saveCodesMessage: 'Store these codes in a safe place.',
      genericError: 'An error occurred.',
    };
    return translations[key] || key;
  },
}));

// Mock useRegenerateBackupCodes hook
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/api', () => ({
  useRegenerateBackupCodes: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('RegenerateBackupCodesModal', () => {
  const mockBackupCodes = ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'];

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockReset();
    // Reset modal store
    act(() => {
      useModalStore.getState().closeAllModals();
    });
  });

  it('does not render when modal is closed', () => {
    render(<RegenerateBackupCodesModal />, { wrapper: createWrapper() });

    // Modal should not be visible when not opened
    expect(
      screen.queryByText('Regenerate Backup Codes'),
    ).not.toBeInTheDocument();
  });

  it('renders modal when opened via store', () => {
    // Open modal via store
    act(() => {
      useModalStore.getState().openModal('regenerateBackupCodes');
    });

    render(<RegenerateBackupCodesModal />, { wrapper: createWrapper() });

    expect(screen.getByText('Regenerate Backup Codes')).toBeInTheDocument();
  });

  it('shows warning message', () => {
    act(() => {
      useModalStore.getState().openModal('regenerateBackupCodes');
    });

    render(<RegenerateBackupCodesModal />, { wrapper: createWrapper() });

    expect(
      screen.getByText('This will invalidate all your existing backup codes.'),
    ).toBeInTheDocument();
  });

  it('displays backup codes after successful regeneration', async () => {
    mockMutateAsync.mockResolvedValueOnce({ backup_codes: mockBackupCodes });

    act(() => {
      useModalStore.getState().openModal('regenerateBackupCodes');
    });

    render(<RegenerateBackupCodesModal />, { wrapper: createWrapper() });

    // Enter code and submit
    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ code: '123456' });
    });

    await waitFor(() => {
      expect(screen.getByText('CODE1')).toBeInTheDocument();
      expect(screen.getByText('CODE5')).toBeInTheDocument();
    });
  });

  it('displays error message on failed regeneration', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Invalid code'));

    act(() => {
      useModalStore.getState().openModal('regenerateBackupCodes');
    });

    render(<RegenerateBackupCodesModal />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid code')).toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    act(() => {
      useModalStore.getState().openModal('regenerateBackupCodes');
    });

    render(<RegenerateBackupCodesModal />, { wrapper: createWrapper() });

    expect(useModalStore.getState().isOpen('regenerateBackupCodes')).toBe(true);

    // Click cancel - this should close the modal via the Ant Design Modal's onCancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(useModalStore.getState().isOpen('regenerateBackupCodes')).toBe(
        false,
      );
    });
  });

  it('closes modal when done button is clicked after regeneration', async () => {
    mockMutateAsync.mockResolvedValueOnce({ backup_codes: mockBackupCodes });

    act(() => {
      useModalStore.getState().openModal('regenerateBackupCodes');
    });

    render(<RegenerateBackupCodesModal />, { wrapper: createWrapper() });

    // Enter code and regenerate
    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    await waitFor(() => {
      expect(screen.getByText('CODE1')).toBeInTheDocument();
    });

    // Click done
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() => {
      expect(useModalStore.getState().isOpen('regenerateBackupCodes')).toBe(
        false,
      );
    });
  });
});
