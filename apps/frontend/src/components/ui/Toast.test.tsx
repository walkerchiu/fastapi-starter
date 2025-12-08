import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast } from './Toast';

function TestComponent() {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => addToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => addToast('Warning message', 'warning')}>
        Show Warning
      </button>
      <button onClick={() => addToast('Info message', 'info')}>
        Show Info
      </button>
      <button onClick={() => addToast('Persistent', 'info', 0)}>
        Show Persistent
      </button>
    </div>
  );
}

describe('Toast', () => {
  it('renders ToastProvider without error', () => {
    render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows success toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('shows error toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('shows warning toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Warning'));
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('shows info toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Info'));
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders toast with role="alert"', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders close button on toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('auto-removes toast after duration', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('does not auto-remove toast when duration is 0', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Persistent'));
    expect(screen.getByText('Persistent')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Persistent')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('can show multiple toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders toast container with aria-live="polite"', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByRole('alert').closest('[aria-live]')).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });

  it('throws error when useToast is used outside ToastProvider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider',
    );
    consoleError.mockRestore();
  });
});
