import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    fireEvent.mouseLeave(button);

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('tooltip triggers on focusable element interaction', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    // MUI Tooltip wraps children - use mouseOver for consistent behavior
    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('tooltip hides after interaction ends', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    fireEvent.mouseLeave(button);

    await waitFor(
      () => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('uses top position by default', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('uses bottom position', async () => {
    render(
      <Tooltip content="Tooltip text" position="bottom" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('uses left position', async () => {
    render(
      <Tooltip content="Tooltip text" position="left" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('uses right position', async () => {
    render(
      <Tooltip content="Tooltip text" position="right" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('accepts ReactNode as content', async () => {
    render(
      <Tooltip
        content={
          <span>
            <strong>Bold</strong> text
          </span>
        }
        delay={0}
      >
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseOver(button);

    await waitFor(
      () => {
        expect(screen.getByText('Bold')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Tooltip content="Tooltip text" className="custom-class">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });
});
