import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';
import { Button } from './Button';

const meta: Meta = {
  title: 'UI/Toast',
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  const { addToast } = useToast();

  return (
    <div className="flex flex-wrap gap-4">
      <Button onClick={() => addToast('This is an info message', 'info')}>
        Show Info Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => addToast('Operation completed!', 'success')}
      >
        Show Success Toast
      </Button>
      <Button
        variant="outline"
        onClick={() => addToast('Please check your input', 'warning')}
      >
        Show Warning Toast
      </Button>
      <Button
        variant="ghost"
        onClick={() => addToast('Something went wrong', 'error')}
      >
        Show Error Toast
      </Button>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <ToastDemo />,
};

function AllToastsDemo() {
  const { addToast } = useToast();

  const showAllToasts = () => {
    addToast('This is an info notification', 'info', 10000);
    setTimeout(
      () => addToast('Operation completed successfully!', 'success', 10000),
      200,
    );
    setTimeout(
      () => addToast('Please review your changes', 'warning', 10000),
      400,
    );
    setTimeout(
      () => addToast('An error occurred. Please try again.', 'error', 10000),
      600,
    );
  };

  return <Button onClick={showAllToasts}>Show All Toast Variants</Button>;
}

export const AllVariants: Story = {
  render: () => <AllToastsDemo />,
};

function CustomDurationDemo() {
  const { addToast } = useToast();

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="outline"
        onClick={() => addToast('Quick toast (2s)', 'info', 2000)}
      >
        2 Second Toast
      </Button>
      <Button
        variant="outline"
        onClick={() => addToast('Normal toast (5s)', 'info', 5000)}
      >
        5 Second Toast
      </Button>
      <Button
        variant="outline"
        onClick={() => addToast('Long toast (10s)', 'info', 10000)}
      >
        10 Second Toast
      </Button>
      <Button
        variant="outline"
        onClick={() => addToast('Persistent toast (manual close)', 'info', 0)}
      >
        Persistent Toast
      </Button>
    </div>
  );
}

export const CustomDuration: Story = {
  render: () => <CustomDurationDemo />,
};

function MultipleToastsDemo() {
  const { addToast } = useToast();

  const showMultiple = () => {
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        addToast(`Toast notification #${i}`, 'info', 8000);
      }, i * 100);
    }
  };

  return <Button onClick={showMultiple}>Show 5 Toasts</Button>;
}

export const MultipleToasts: Story = {
  render: () => <MultipleToastsDemo />,
};
