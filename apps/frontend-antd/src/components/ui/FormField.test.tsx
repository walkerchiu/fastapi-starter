import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormField } from './FormField';
import { Input } from './Input';

describe('FormField', () => {
  it('renders children correctly', () => {
    render(
      <FormField>
        <Input placeholder="Test input" />
      </FormField>,
    );
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>,
    );
    // Ant Design Form.Item renders required as aria-required or a visual indicator
    const formItem = document.querySelector('.ant-form-item-required');
    expect(formItem).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(
      <FormField label="Email" error="Email is required">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <FormField label="Email" description="Enter your email address">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('shows error instead of description when error is present', () => {
    render(
      <FormField
        label="Email"
        description="Helpful description"
        error="Error message"
      >
        <Input />
      </FormField>,
    );
    // In Ant Design, error takes precedence over description in the help text
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
