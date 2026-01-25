import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Steps } from './Steps';

const meta: Meta<typeof Steps> = {
  title: 'UI/Steps',
  component: Steps,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    clickable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems = [
  { title: 'Step 1' },
  { title: 'Step 2' },
  { title: 'Step 3' },
  { title: 'Step 4' },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    current: 1,
  },
};

export const AllDirections: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Horizontal
        </h3>
        <Steps items={defaultItems} current={1} direction="horizontal" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Vertical
        </h3>
        <Steps items={defaultItems} current={1} direction="vertical" />
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Small
        </h3>
        <Steps items={defaultItems} current={1} size="sm" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Medium
        </h3>
        <Steps items={defaultItems} current={1} size="md" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Large
        </h3>
        <Steps items={defaultItems} current={1} size="lg" />
      </div>
    </div>
  ),
};

export const WithDescriptions: Story = {
  args: {
    items: [
      { title: 'Account', description: 'Create your account' },
      { title: 'Profile', description: 'Set up your profile' },
      { title: 'Verification', description: 'Verify your email' },
      { title: 'Complete', description: 'All done!' },
    ],
    current: 1,
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        title: 'Cart',
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
      {
        title: 'Shipping',
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        ),
      },
      {
        title: 'Payment',
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        ),
      },
      {
        title: 'Confirmation',
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    ],
    current: 1,
  },
};

export const Clickable: Story = {
  render: function ClickableSteps() {
    const [current, setCurrent] = useState(0);
    return (
      <div className="space-y-4">
        <Steps
          items={[
            { title: 'Step 1', description: 'Click to navigate' },
            { title: 'Step 2', description: 'Click to navigate' },
            { title: 'Step 3', description: 'Click to navigate' },
            { title: 'Step 4', description: 'Click to navigate' },
          ]}
          current={current}
          onChange={setCurrent}
          clickable
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Current step: {current + 1}
        </p>
      </div>
    );
  },
};

export const WithError: Story = {
  args: {
    items: [
      { title: 'Step 1', status: 'completed' },
      { title: 'Step 2', status: 'completed' },
      { title: 'Step 3', status: 'error' },
      { title: 'Step 4', status: 'pending' },
    ],
  },
};
