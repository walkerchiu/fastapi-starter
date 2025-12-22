import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination with correct page buttons', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(
      screen.getByRole('navigation', { name: /pagination/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 5')).toBeInTheDocument();
  });

  it('marks current page with aria-current', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    const currentPageButton = screen.getByLabelText('Go to page 3');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('calls onPageChange when clicking a page number', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to page 3'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking next button', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking previous button', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to previous page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to first page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).toBeDisabled();
  });

  it('calls onPageChange when clicking first page button', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to first page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when clicking last page button', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to last page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  it('hides first/last buttons when showFirstLast is false', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
        showFirstLast={false}
      />,
    );

    expect(screen.queryByLabelText('Go to first page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to last page')).not.toBeInTheDocument();
  });

  it('shows ellipsis for large page counts', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />,
    );

    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('navigates with arrow keys', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    const nav = screen.getByRole('navigation');
    fireEvent.keyDown(nav, { key: 'ArrowLeft' });
    expect(mockOnPageChange).toHaveBeenCalledWith(2);

    mockOnPageChange.mockClear();
    fireEvent.keyDown(nav, { key: 'ArrowRight' });
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('does not call onPageChange when clicking current page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to page 3'));
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        className="custom-class"
      />,
    );

    expect(screen.getByRole('navigation')).toHaveClass('custom-class');
  });

  it('renders different sizes', () => {
    const { rerender } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        size="sm"
      />,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    rerender(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        size="lg"
      />,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
