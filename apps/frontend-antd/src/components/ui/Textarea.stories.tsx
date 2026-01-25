import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    disabled: { control: 'boolean' },
    showCount: { control: 'boolean' },
    rows: { control: 'number' },
    maxLength: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter description...',
  },
};

export const WithError: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    error: 'Bio is required',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Enter your comments...',
    hint: 'Maximum 500 characters allowed.',
  },
};

export const WithCount: Story = {
  render: function WithCountStory() {
    const [value, setValue] = useState('');
    return (
      <Textarea
        label="Message"
        placeholder="Type your message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={200}
        showCount
      />
    );
  },
};

export const AllResizeOptions: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Textarea
        label="No resize"
        resize="none"
        placeholder="Cannot resize..."
      />
      <Textarea
        label="Vertical resize"
        resize="vertical"
        placeholder="Resize vertically..."
      />
      <Textarea
        label="Horizontal resize"
        resize="horizontal"
        placeholder="Resize horizontally..."
      />
      <Textarea
        label="Both directions"
        resize="both"
        placeholder="Resize both ways..."
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Textarea',
    placeholder: 'This is disabled...',
    disabled: true,
    value: 'This content cannot be edited.',
  },
};

export const CustomRows: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Textarea label="2 rows" rows={2} placeholder="Small textarea..." />
      <Textarea
        label="4 rows (default)"
        rows={4}
        placeholder="Default size..."
      />
      <Textarea label="8 rows" rows={8} placeholder="Large textarea..." />
    </div>
  ),
};

export const FullExample: Story = {
  render: function FullExampleStory() {
    const [value, setValue] = useState('');
    const maxLength = 500;
    const isError = value.length > 0 && value.length < 10;

    return (
      <Textarea
        label="Feedback"
        placeholder="Please share your feedback..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
        showCount
        error={isError ? 'Feedback must be at least 10 characters.' : undefined}
        hint={!isError ? 'We appreciate your detailed feedback.' : undefined}
      />
    );
  },
};
