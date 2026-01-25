import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tooltip } from './Tooltip';

// Increase timeout for animations
vi.setConfig({ testTimeout: 10000 });

describe('Tooltip', () => {
  it('renders trigger element', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    await act(async () => {
      fireEvent.mouseEnter(screen.getByText('Hover me'));
    });
    await waitFor(
      () => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );
    const trigger = screen.getByText('Hover me');

    await act(async () => {
      fireEvent.mouseEnter(trigger);
    });
    await waitFor(
      () => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await act(async () => {
      fireEvent.mouseLeave(trigger);
    });
    // Ant Design tooltip remains in DOM but gets hidden class
    await waitFor(
      () => {
        const tooltip = document.querySelector('.ant-tooltip');
        expect(tooltip).toHaveClass('ant-tooltip-hidden');
      },
      { timeout: 3000 },
    );
  });

  it('accepts different placements', () => {
    render(
      <Tooltip content="Tooltip text" placement="right">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });
});
