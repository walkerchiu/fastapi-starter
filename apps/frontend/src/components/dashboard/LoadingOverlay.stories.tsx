import type { Meta, StoryObj } from '@storybook/react';
import { LoadingOverlay } from './LoadingOverlay';
import { Card, CardBody } from '../ui/Card';

const meta: Meta<typeof LoadingOverlay> = {
  title: 'Dashboard/Feedback/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

const SampleContent = () => (
  <Card className="w-80">
    <CardBody>
      <h3 className="mb-2 text-lg font-semibold">Sample Card</h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is some content that will be covered by the loading overlay.
      </p>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </CardBody>
  </Card>
);

export const Default: Story = {
  args: {
    loading: true,
    children: <SampleContent />,
  },
};

export const WithText: Story = {
  args: {
    loading: true,
    text: 'Loading data...',
    children: <SampleContent />,
  },
};

export const NoBlur: Story = {
  args: {
    loading: true,
    blur: false,
    children: <SampleContent />,
  },
};

export const NotLoading: Story = {
  args: {
    loading: false,
    children: <SampleContent />,
  },
};

export const LargeContent: Story = {
  args: {
    loading: true,
    text: 'Processing...',
    children: (
      <div className="w-96 space-y-4">
        <Card>
          <CardBody>
            <h3 className="mb-2 font-semibold">Section 1</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Content for section one.
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="mb-2 font-semibold">Section 2</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Content for section two.
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="mb-2 font-semibold">Section 3</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Content for section three.
            </p>
          </CardBody>
        </Card>
      </div>
    ),
  },
};
