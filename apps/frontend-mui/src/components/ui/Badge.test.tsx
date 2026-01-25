import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies neutral variant by default', () => {
    render(<Badge>Default</Badge>);
    // MUI Chip uses colorDefault for neutral
    const chip = screen.getByText('Default').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorDefault');
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success">Success</Badge>);
    const chip = screen.getByText('Success').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorSuccess');
  });

  it('applies error variant styles', () => {
    render(<Badge variant="error">Error</Badge>);
    const chip = screen.getByText('Error').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorError');
  });

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const chip = screen.getByText('Warning').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorWarning');
  });

  it('applies info variant styles', () => {
    render(<Badge variant="info">Info</Badge>);
    const chip = screen.getByText('Info').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorInfo');
  });

  it('has base MUI Chip styles', () => {
    render(<Badge>Badge</Badge>);
    const chip = screen.getByText('Badge').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-root');
    expect(chip).toHaveClass('MuiChip-sizeSmall');
  });

  it('accepts custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const chip = screen.getByText('Custom').closest('.MuiChip-root');
    expect(chip).toHaveClass('custom-class');
  });

  it('preserves base styles with custom className', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    const chip = screen.getByText('Badge').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-root');
    expect(chip).toHaveClass('custom-class');
  });
});
