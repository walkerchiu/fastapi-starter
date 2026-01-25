import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders spinner correctly', () => {
    render(<Spinner />);
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<Spinner size="sm" />);
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    render(<Spinner size="md" />);
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders with large size', () => {
    render(<Spinner size="lg" />);
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<Spinner className="custom-class" />);
    const spinner = document.querySelector('.ant-spin');
    expect(spinner).toHaveClass('custom-class');
  });
});
