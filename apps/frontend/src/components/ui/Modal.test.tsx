import { fireEvent, render, screen } from '@testing-library/react';
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
    const titleElement = screen.getByText('Modal Title');
    expect(dialog).toHaveAttribute('aria-labelledby', titleElement.id);
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

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const overlay = screen
      .getByRole('dialog')
      .querySelector('.flex.min-h-full');
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on overlay click when closeOnOverlayClick is false', () => {
    const onClose = vi.fn();
    render(
      <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />,
    );
    const overlay = screen
      .getByRole('dialog')
      .querySelector('.flex.min-h-full');
    fireEvent.click(overlay!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when clicking modal content', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Modal content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies sm size class', () => {
    render(<Modal {...defaultProps} size="sm" />);
    expect(
      screen.getByRole('dialog').querySelector('.max-w-sm'),
    ).toBeInTheDocument();
  });

  it('applies md size class by default', () => {
    render(<Modal {...defaultProps} />);
    expect(
      screen.getByRole('dialog').querySelector('.max-w-md'),
    ).toBeInTheDocument();
  });

  it('applies lg size class', () => {
    render(<Modal {...defaultProps} size="lg" />);
    expect(
      screen.getByRole('dialog').querySelector('.max-w-lg'),
    ).toBeInTheDocument();
  });

  it('applies xl size class', () => {
    render(<Modal {...defaultProps} size="xl" />);
    expect(
      screen.getByRole('dialog').querySelector('.max-w-xl'),
    ).toBeInTheDocument();
  });

  it('prevents body scroll when open', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });
});
