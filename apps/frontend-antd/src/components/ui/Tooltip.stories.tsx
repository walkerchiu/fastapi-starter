import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const Top: Story = {
  args: {
    content: 'Tooltip on top',
    placement: 'top',
    children: <Button>Top</Button>,
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip on right',
    placement: 'right',
    children: <Button>Right</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip on bottom',
    placement: 'bottom',
    children: <Button>Bottom</Button>,
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip on left',
    placement: 'left',
    children: <Button>Left</Button>,
  },
};

export const AllPlacements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-8">
      <div />
      <Tooltip content="Top" placement="top">
        <Button className="w-full">Top</Button>
      </Tooltip>
      <div />
      <Tooltip content="Left" placement="left">
        <Button className="w-full">Left</Button>
      </Tooltip>
      <div />
      <Tooltip content="Right" placement="right">
        <Button className="w-full">Right</Button>
      </Tooltip>
      <div />
      <Tooltip content="Bottom" placement="bottom">
        <Button className="w-full">Bottom</Button>
      </Tooltip>
      <div />
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    content:
      'This is a longer tooltip that provides more detailed information about the element.',
    children: <Button>Hover for details</Button>,
  },
};
