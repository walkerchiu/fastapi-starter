import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonText, SkeletonCard } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    variant: 'text',
    width: '200px',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 48,
    height: 48,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: '100%',
    height: 200,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Text
        </p>
        <Skeleton variant="text" width="60%" />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Circular
        </p>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Rectangular
        </p>
        <Skeleton variant="rectangular" width="100%" height={120} />
      </div>
    </div>
  ),
};

export const Animations: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Pulse (default)
        </p>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={60}
          animation="pulse"
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Wave
        </p>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={60}
          animation="wave"
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          None
        </p>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={60}
          animation="none"
        />
      </div>
    </div>
  ),
};

export const TextBlock: Story = {
  render: () => <SkeletonText lines={4} />,
};

export const CardSkeleton: Story = {
  render: () => <SkeletonCard />,
};

export const CardWithoutAvatar: Story = {
  render: () => <SkeletonCard showAvatar={false} />,
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
};

export const ProfileSkeleton: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" height="1.5em" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  ),
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      ))}
    </div>
  ),
};
