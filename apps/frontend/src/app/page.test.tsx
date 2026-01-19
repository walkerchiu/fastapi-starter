import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('should render Hello World heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /hello world/i }),
    ).toBeInTheDocument();
  });
});
