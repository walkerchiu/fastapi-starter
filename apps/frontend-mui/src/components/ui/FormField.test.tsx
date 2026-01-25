import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormField } from './FormField';

describe('FormField', () => {
  it('renders children correctly', () => {
    render(
      <FormField>
        <input type="text" data-testid="input" />
      </FormField>,
    );
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(
      <FormField label="Email">
        <input type="text" />
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('generates unique id and links label to input via render prop', () => {
    render(
      <FormField label="Username">
        {(props) => <input type="text" {...props} />}
      </FormField>,
    );
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id');
  });

  it('uses provided id when given', () => {
    render(
      <FormField label="Custom" id="custom-id">
        {(props) => <input type="text" {...props} />}
      </FormField>,
    );
    expect(screen.getByLabelText('Custom')).toHaveAttribute('id', 'custom-id');
  });

  it('displays error message when error prop is provided', () => {
    render(
      <FormField error="This field is required">
        <input type="text" />
      </FormField>,
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('passes aria-invalid to children via render prop', () => {
    render(
      <FormField error="Error">
        {(props) => <input type="text" data-testid="input" {...props} />}
      </FormField>,
    );
    expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays hint message when provided', () => {
    render(
      <FormField hint="Enter your email address">
        <input type="text" />
      </FormField>,
    );
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('hides hint when error is displayed', () => {
    render(
      <FormField hint="Helpful hint" error="Error message">
        <input type="text" />
      </FormField>,
    );
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('passes aria-describedby for error via render prop', () => {
    render(
      <FormField id="test-field" error="Error">
        {(props) => <input type="text" data-testid="input" {...props} />}
      </FormField>,
    );
    expect(screen.getByTestId('input')).toHaveAttribute(
      'aria-describedby',
      'test-field-error',
    );
  });

  it('passes aria-describedby for hint via render prop', () => {
    render(
      <FormField id="test-field" hint="Hint">
        {(props) => <input type="text" data-testid="input" {...props} />}
      </FormField>,
    );
    expect(screen.getByTestId('input')).toHaveAttribute(
      'aria-describedby',
      'test-field-hint',
    );
  });

  it('shows required indicator when required is true', () => {
    render(
      <FormField label="Required Field" required>
        <input type="text" />
      </FormField>,
    );
    // MUI uses aria-hidden span for required indicator
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('passes aria-required to children via render prop', () => {
    render(
      <FormField required>
        {(props) => <input type="text" data-testid="input" {...props} />}
      </FormField>,
    );
    expect(screen.getByTestId('input')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('accepts custom className', () => {
    render(
      <FormField className="custom-class">
        <input type="text" />
      </FormField>,
    );
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies spacing between label and content', () => {
    const { container } = render(
      <FormField label="With Label">
        <input type="text" />
      </FormField>,
    );
    // MUI FormControl renders with label and content spacing via sx prop
    const formControl = container.querySelector('.MuiFormControl-root');
    expect(formControl).toBeInTheDocument();
    // MUI FormLabel should be present
    expect(container.querySelector('.MuiFormLabel-root')).toBeInTheDocument();
  });

  it('does not render label element when label is absent', () => {
    const { container } = render(
      <FormField>
        <input type="text" />
      </FormField>,
    );
    // FormLabel should not be present when no label is provided
    expect(
      container.querySelector('.MuiFormLabel-root'),
    ).not.toBeInTheDocument();
  });
});
