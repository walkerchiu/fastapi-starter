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
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: { control: { type: 'number', min: 0, max: 1000, step: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const Top: Story = {
  args: {
    content: 'Tooltip on top',
    position: 'top',
    children: <Button>Top</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip on bottom',
    position: 'bottom',
    children: <Button>Bottom</Button>,
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip on left',
    position: 'left',
    children: <Button>Left</Button>,
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip on right',
    position: 'right',
    children: <Button>Right</Button>,
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      <div />
      <div className="flex justify-center">
        <Tooltip content="Top tooltip" position="top">
          <Button variant="outline">Top</Button>
        </Tooltip>
      </div>
      <div />
      <div className="flex justify-end">
        <Tooltip content="Left tooltip" position="left">
          <Button variant="outline">Left</Button>
        </Tooltip>
      </div>
      <div className="flex justify-center">
        <Tooltip content="Default tooltip">
          <Button>Hover</Button>
        </Tooltip>
      </div>
      <div>
        <Tooltip content="Right tooltip" position="right">
          <Button variant="outline">Right</Button>
        </Tooltip>
      </div>
      <div />
      <div className="flex justify-center">
        <Tooltip content="Bottom tooltip" position="bottom">
          <Button variant="outline">Bottom</Button>
        </Tooltip>
      </div>
      <div />
    </div>
  ),
};

export const WithDelay: Story = {
  args: {
    content: 'This tooltip appears after 500ms',
    delay: 500,
    children: <Button>Slow tooltip (500ms)</Button>,
  },
};

export const NoDelay: Story = {
  args: {
    content: 'Instant tooltip',
    delay: 0,
    children: <Button>Instant tooltip</Button>,
  },
};

export const LongContent: Story = {
  args: {
    content:
      'This is a longer tooltip message that provides more detailed information',
    children: <Button>Long tooltip</Button>,
  },
};

export const OnIcon: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="Settings">
        <button
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Settings"
        >
          <svg
            className="h-5 w-5 text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </Tooltip>
      <Tooltip content="Help">
        <button
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Help"
        >
          <svg
            className="h-5 w-5 text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </Tooltip>
    </div>
  ),
};
