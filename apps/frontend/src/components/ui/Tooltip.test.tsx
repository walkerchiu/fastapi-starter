import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('shows tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    const container = screen.getByText('Hover me').parentElement!;
    fireEvent.mouseEnter(container);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(container);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus after delay', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    const container = screen.getByText('Hover me').parentElement!;
    fireEvent.focus(container);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(container);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('uses custom delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('does not show tooltip if mouse leaves before delay', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    const container = screen.getByText('Hover me').parentElement!;
    fireEvent.mouseEnter(container);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.mouseLeave(container);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies top position by default', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('bottom-full');
  });

  it('applies bottom position', () => {
    render(
      <Tooltip content="Tooltip text" position="bottom">
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('top-full');
  });

  it('applies left position', () => {
    render(
      <Tooltip content="Tooltip text" position="left">
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('right-full');
  });

  it('applies right position', () => {
    render(
      <Tooltip content="Tooltip text" position="right">
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('left-full');
  });

  it('sets aria-describedby when tooltip is visible', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    const childContainer = screen.getByText('Hover me').parentElement!;

    expect(childContainer).not.toHaveAttribute('aria-describedby');

    fireEvent.mouseEnter(childContainer.parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(childContainer).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('accepts ReactNode as content', () => {
    render(
      <Tooltip
        content={
          <span>
            <strong>Bold</strong> text
          </span>
        }
      >
        <button>Hover me</button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('Bold')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Tooltip content="Tooltip text" className="custom-class">
        <button>Hover me</button>
      </Tooltip>,
    );
    const wrapper = screen.getByText('Hover me').closest('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });
});
