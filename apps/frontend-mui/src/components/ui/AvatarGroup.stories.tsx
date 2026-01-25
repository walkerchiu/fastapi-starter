import type { Meta, StoryObj } from '@storybook/react';
import { AvatarGroup } from './AvatarGroup';
import { Avatar } from './Avatar';

const meta: Meta<typeof AvatarGroup> = {
  title: 'UI/AvatarGroup',
  component: AvatarGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    max: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar name="Alice Brown" />
      <Avatar name="Bob Smith" />
      <Avatar name="Charlie Davis" />
      <Avatar name="Diana Evans" />
    </AvatarGroup>
  ),
};

export const WithMax: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="Alice Brown" />
      <Avatar name="Bob Smith" />
      <Avatar name="Charlie Davis" />
      <Avatar name="Diana Evans" />
      <Avatar name="Edward Fox" />
      <Avatar name="Fiona Green" />
    </AvatarGroup>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <AvatarGroup size="xs" max={4}>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
        <Avatar name="Diana" />
        <Avatar name="Edward" />
      </AvatarGroup>
      <AvatarGroup size="sm" max={4}>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
        <Avatar name="Diana" />
        <Avatar name="Edward" />
      </AvatarGroup>
      <AvatarGroup size="md" max={4}>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
        <Avatar name="Diana" />
        <Avatar name="Edward" />
      </AvatarGroup>
      <AvatarGroup size="lg" max={4}>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
        <Avatar name="Diana" />
        <Avatar name="Edward" />
      </AvatarGroup>
      <AvatarGroup size="xl" max={4}>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
        <Avatar name="Diana" />
        <Avatar name="Edward" />
      </AvatarGroup>
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=facearea&facepad=2"
        alt="User 1"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=facearea&facepad=2"
        alt="User 2"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=facearea&facepad=2"
        alt="User 3"
      />
      <Avatar name="Diana Evans" />
      <Avatar name="Edward Fox" />
    </AvatarGroup>
  ),
};

export const ManyAvatars: Story = {
  render: () => (
    <AvatarGroup max={5}>
      <Avatar name="Alice" />
      <Avatar name="Bob" />
      <Avatar name="Charlie" />
      <Avatar name="Diana" />
      <Avatar name="Edward" />
      <Avatar name="Fiona" />
      <Avatar name="George" />
      <Avatar name="Hannah" />
      <Avatar name="Ivan" />
      <Avatar name="Julia" />
    </AvatarGroup>
  ),
};

export const FewAvatars: Story = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar name="Alice" />
      <Avatar name="Bob" />
    </AvatarGroup>
  ),
};
