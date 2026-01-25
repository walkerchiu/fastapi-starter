import type { Meta, StoryObj } from '@storybook/react';
import { FormActions } from './FormActions';
import { FormSection } from './FormSection';
import { Form } from 'antd';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const meta: Meta<typeof FormActions> = {
  title: 'Dashboard/Form/FormActions',
  component: FormActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof FormActions>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </>
    ),
  },
};

export const AlignLeft: Story = {
  args: {
    align: 'left',
    children: (
      <>
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
      </>
    ),
  },
};

export const AlignCenter: Story = {
  args: {
    align: 'center',
    children: (
      <>
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </>
    ),
  },
};

export const WithForm: Story = {
  render: () => (
    <div style={{ maxWidth: 512 }}>
      <FormSection
        title="Edit Profile"
        description="Update your profile information."
      >
        <Form layout="vertical">
          <Form.Item label="Name" required>
            <Input placeholder="John Doe" defaultValue="John Doe" />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input
              type="email"
              placeholder="john@example.com"
              defaultValue="john@example.com"
            />
          </Form.Item>
          <Form.Item label="Phone">
            <Input type="tel" placeholder="+1 (555) 000-0000" />
          </Form.Item>
        </Form>
      </FormSection>
      <FormActions>
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </FormActions>
    </div>
  ),
};

export const MultipleButtons: Story = {
  args: {
    children: (
      <>
        <Button variant="danger">Delete</Button>
        <div style={{ flex: 1 }} />
        <Button variant="outline">Cancel</Button>
        <Button variant="secondary">Save Draft</Button>
        <Button>Publish</Button>
      </>
    ),
  },
};

export const LoadingState: Story = {
  args: {
    children: (
      <>
        <Button variant="outline" disabled>
          Cancel
        </Button>
        <Button loading>Saving...</Button>
      </>
    ),
  },
};
