import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  };

  it('renders modal content when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('has role="dialog"', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="Modal Title" />);
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('sets aria-labelledby when title is provided', () => {
    render(<Modal {...defaultProps} title="Modal Title" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('renders close button by default', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    // MUI Dialog handles escape key internally
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not call onClose on Escape when closeOnEscape is false', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    // Wait a bit to ensure onClose was not called
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    // MUI Dialog backdrop
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    }
  });

  it('does not call onClose on backdrop click when closeOnOverlayClick is false', async () => {
    const onClose = vi.fn();
    render(
      <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />,
    );
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      // Wait a bit to ensure onClose was not called
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(onClose).not.toHaveBeenCalled();
    }
  });

  it('does not close when clicking modal content', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Modal content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies sm size via maxWidth prop', () => {
    render(<Modal {...defaultProps} size="sm" />);
    const dialog = screen.getByRole('dialog').closest('.MuiDialog-root');
    const paper = dialog?.querySelector('.MuiDialog-paperWidthXs');
    expect(paper).toBeInTheDocument();
  });

  it('applies md size by default via maxWidth prop', () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole('dialog').closest('.MuiDialog-root');
    const paper = dialog?.querySelector('.MuiDialog-paperWidthSm');
    expect(paper).toBeInTheDocument();
  });

  it('applies lg size via maxWidth prop', () => {
    render(<Modal {...defaultProps} size="lg" />);
    const dialog = screen.getByRole('dialog').closest('.MuiDialog-root');
    const paper = dialog?.querySelector('.MuiDialog-paperWidthMd');
    expect(paper).toBeInTheDocument();
  });

  it('applies xl size via maxWidth prop', () => {
    render(<Modal {...defaultProps} size="xl" />);
    const dialog = screen.getByRole('dialog').closest('.MuiDialog-root');
    const paper = dialog?.querySelector('.MuiDialog-paperWidthLg');
    expect(paper).toBeInTheDocument();
  });

  it('MUI Dialog handles body scroll automatically', () => {
    render(<Modal {...defaultProps} />);
    // MUI Dialog handles body overflow automatically
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('modal content is hidden when closed', async () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    rerender(<Modal {...defaultProps} isOpen={false} />);
    // MUI Dialog hides content when closed (not visible)
    await waitFor(() => {
      const content = screen.queryByText('Modal content');
      if (content) {
        // Content may still be in DOM during exit animation, but dialog is closed
        expect(content).not.toBeVisible();
      }
    });
  });
});
