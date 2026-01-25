import type { Meta, StoryObj } from '@storybook/react';
import { FormSection } from './FormSection';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';

const meta: Meta<typeof FormSection> = {
  title: 'Dashboard/Form/FormSection',
  component: FormSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof FormSection>;

export const Default: Story = {
  args: {
    title: 'Personal Information',
    description: 'Update your personal details here.',
    children: (
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First Name" required>
          <Input placeholder="John" />
        </FormField>
        <FormField label="Last Name" required>
          <Input placeholder="Doe" />
        </FormField>
        <FormField label="Email" required className="sm:col-span-2">
          <Input type="email" placeholder="john@example.com" />
        </FormField>
      </div>
    ),
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Account Settings',
    children: (
      <div className="space-y-4">
        <FormField label="Username">
          <Input placeholder="johndoe" />
        </FormField>
        <FormField label="Language">
          <Select
            value=""
            onChange={() => {}}
            options={[
              { value: 'en', label: 'English' },
              { value: 'zh-TW', label: '繁體中文' },
            ]}
          />
        </FormField>
      </div>
    ),
  },
};

export const SecuritySettings: Story = {
  args: {
    title: 'Security',
    description: 'Manage your account security settings.',
    children: (
      <div className="space-y-4">
        <FormField label="Current Password">
          <Input type="password" />
        </FormField>
        <FormField label="New Password">
          <Input type="password" />
        </FormField>
        <FormField label="Confirm Password">
          <Input type="password" />
        </FormField>
        <div className="pt-2">
          <Checkbox
            checked={false}
            onChange={() => {}}
            label="Enable two-factor authentication"
          />
        </div>
      </div>
    ),
  },
};

export const MultipleSections: Story = {
  render: () => (
    <div className="space-y-6">
      <FormSection
        title="Profile"
        description="Your public profile information."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Display Name">
            <Input placeholder="John Doe" />
          </FormField>
          <FormField label="Bio">
            <Input placeholder="A short bio..." />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Notifications"
        description="Configure how you receive notifications."
      >
        <div className="space-y-3">
          <Checkbox
            checked={true}
            onChange={() => {}}
            label="Email notifications"
          />
          <Checkbox
            checked={false}
            onChange={() => {}}
            label="Push notifications"
          />
          <Checkbox checked={true} onChange={() => {}} label="Weekly digest" />
        </div>
      </FormSection>
    </div>
  ),
};
