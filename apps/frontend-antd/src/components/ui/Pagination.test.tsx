import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

describe('Pagination', () => {
  const noop = () => {};

  it('renders pagination correctly', () => {
    render(
      <Pagination current={1} total={100} pageSize={10} onChange={noop} />,
    );
    expect(document.querySelector('.ant-pagination')).toBeInTheDocument();
  });

  it('displays page numbers', () => {
    render(<Pagination current={1} total={50} pageSize={10} onChange={noop} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onChange when page is changed', () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={handleChange}
      />,
    );
    const page2 = screen.getByText('2');
    fireEvent.click(page2);
    expect(handleChange).toHaveBeenCalledWith(2, 10);
  });

  it('disables previous button on first page', () => {
    render(<Pagination current={1} total={50} pageSize={10} onChange={noop} />);
    const prevButton = screen.getByTitle('Previous Page');
    expect(prevButton.closest('li')).toHaveClass('ant-pagination-disabled');
  });

  it('disables next button on last page', () => {
    render(<Pagination current={5} total={50} pageSize={10} onChange={noop} />);
    const nextButton = screen.getByTitle('Next Page');
    expect(nextButton.closest('li')).toHaveClass('ant-pagination-disabled');
  });
});
