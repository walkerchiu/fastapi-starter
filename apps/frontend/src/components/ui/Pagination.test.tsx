import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders page buttons for small page counts', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to page 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 3' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 4' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 5' }),
    ).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />,
    );

    const currentPageButton = screen.getByRole('button', {
      name: 'Go to page 3',
    });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    expect(currentPageButton).toHaveClass('bg-indigo-600');
  });

  it('calls onPageChange when a page button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when next button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={handlePageChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when previous button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Go to previous page' }),
    );
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to previous page' }),
    ).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to next page' }),
    ).toBeDisabled();
  });

  it('renders first and last buttons when showFirstLast is true', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={vi.fn()}
        showFirstLast={true}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to first page' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to last page' }),
    ).toBeInTheDocument();
  });

  it('does not render first and last buttons when showFirstLast is false', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={vi.fn()}
        showFirstLast={false}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Go to first page' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Go to last page' }),
    ).not.toBeInTheDocument();
  });

  it('calls onPageChange when first button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={handlePageChange}
        showFirstLast={true}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to first page' }));
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when last button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={handlePageChange}
        showFirstLast={true}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to last page' }));
    expect(handlePageChange).toHaveBeenCalledWith(10);
  });

  it('disables first button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={vi.fn()}
        showFirstLast={true}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to first page' }),
    ).toBeDisabled();
  });

  it('disables last button on last page', () => {
    render(
      <Pagination
        currentPage={10}
        totalPages={10}
        onPageChange={vi.fn()}
        showFirstLast={true}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to last page' }),
    ).toBeDisabled();
  });

  it('renders ellipsis for large page counts', () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />,
    );

    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
        className="custom-class"
      />,
    );

    expect(screen.getByRole('navigation')).toHaveClass('custom-class');
  });

  it('has proper aria-label for navigation', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Pagination',
    );
  });
});
