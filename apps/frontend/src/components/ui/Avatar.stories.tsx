import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    src: { control: 'text' },
    alt: { control: 'text' },
    name: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="xs" name="John Doe" />
      <Avatar size="sm" name="John Doe" />
      <Avatar size="md" name="John Doe" />
      <Avatar size="lg" name="John Doe" />
      <Avatar size="xl" name="John Doe" />
    </div>
  ),
};

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'User avatar',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
};

export const WithSingleName: Story = {
  args: {
    name: 'Alice',
  },
};

export const BrokenImage: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.com/image.jpg',
    name: 'Fallback User',
  },
};

export const DifferentNames: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Alice Brown" />
      <Avatar name="Bob Smith" />
      <Avatar name="Charlie Davis" />
      <Avatar name="Diana Evans" />
      <Avatar name="Edward Fox" />
      <Avatar name="Fiona Green" />
    </div>
  ),
};

export const MixedContent: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt="With image"
      />
      <Avatar name="With Initials" />
      <Avatar />
    </div>
  ),
};
