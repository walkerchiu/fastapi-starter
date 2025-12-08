import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card, CardBody, CardHeader } from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has base styles', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('shadow');
  });

  it('accepts custom className', () => {
    render(
      <Card data-testid="card" className="custom-class">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('has border and padding styles', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-gray-200');
    expect(header).toHaveClass('px-6');
    expect(header).toHaveClass('py-4');
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

  it('has padding styles', () => {
    render(<CardBody data-testid="body">Body</CardBody>);
    const body = screen.getByTestId('body');
    expect(body).toHaveClass('p-6');
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
