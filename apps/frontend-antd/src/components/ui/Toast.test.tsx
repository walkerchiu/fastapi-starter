import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from 'antd';

import { Toast, useToast } from './Toast';

// Test component to use the hook
function TestComponent() {
  const toast = useToast();
  return (
    <button onClick={() => toast.success('Success message')}>Show Toast</button>
  );
}

describe('Toast', () => {
  it('renders Toast component', () => {
    render(<Toast variant="success">Success message</Toast>);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('renders success variant', () => {
    render(<Toast variant="success">Success</Toast>);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders error variant', () => {
    render(<Toast variant="error">Error</Toast>);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders warning variant', () => {
    render(<Toast variant="warning">Warning</Toast>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders info variant', () => {
    render(<Toast variant="info">Info</Toast>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });
});

describe('useToast', () => {
  it('provides toast methods', () => {
    render(
      <App>
        <TestComponent />
      </App>,
    );
    expect(screen.getByText('Show Toast')).toBeInTheDocument();
  });
});
