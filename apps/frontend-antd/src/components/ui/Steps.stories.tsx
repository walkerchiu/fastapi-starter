import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Steps } from './Steps';
import {
  ShoppingCartOutlined,
  CarOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

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
      { title: 'Cart', icon: <ShoppingCartOutlined /> },
      { title: 'Shipping', icon: <CarOutlined /> },
      { title: 'Payment', icon: <CreditCardOutlined /> },
      { title: 'Confirmation', icon: <CheckCircleOutlined /> },
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
