import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card, CardBody, CardHeader } from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has Ant Design Card styles', () => {
    render(<Card>Content</Card>);
    const card = document.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = document.querySelector('.ant-card');
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(
      <CardHeader data-testid="header" className="custom-header">
        Header
      </CardHeader>,
    );
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-header');
  });
});

describe('CardBody', () => {
  it('renders children correctly', () => {
    render(<CardBody>Body content</CardBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(
      <CardBody data-testid="body" className="custom-body">
        Body
      </CardBody>,
    );
    const body = screen.getByTestId('body');
    expect(body).toHaveClass('custom-body');
  });
});

describe('Card composition', () => {
  it('works with CardHeader and CardBody together', () => {
    render(
      <Card>
        <CardHeader>Title</CardHeader>
        <CardBody>Content</CardBody>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
