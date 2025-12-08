import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    children: (props) => (
      <input
        {...props}
        type="email"
        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
        placeholder="you@example.com"
      />
    ),
  },
};

export const Required: Story = {
  args: {
    label: 'Username',
    required: true,
    children: (props) => (
      <input
        {...props}
        type="text"
        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
        placeholder="Enter username"
      />
    ),
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    hint: 'Must be at least 8 characters with one number',
    children: (props) => (
      <input
        {...props}
        type="password"
        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
        placeholder="Enter password"
      />
    ),
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Please enter a valid email address',
    children: (props) => (
      <input
        {...props}
        type="email"
        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-500 dark:bg-gray-800 dark:text-gray-100 dark:ring-red-700 sm:text-sm sm:leading-6"
        placeholder="you@example.com"
        defaultValue="invalid-email"
      />
    ),
  },
};

export const WithTextarea: Story = {
  args: {
    label: 'Description',
    hint: 'Write a brief description',
    children: (props) => (
      <textarea
        {...props}
        rows={4}
        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
        placeholder="Enter description..."
      />
    ),
  },
};

export const WithSelect: Story = {
  args: {
    label: 'Country',
    required: true,
    children: (props) => (
      <select
        {...props}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
      >
        <option value="">Select a country</option>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk">United Kingdom</option>
      </select>
    ),
  },
};

export const CompleteForm: Story = {
  render: () => (
    <form className="space-y-6">
      <FormField label="Full Name" required>
        {(props) => (
          <input
            {...props}
            type="text"
            className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
            placeholder="John Doe"
          />
        )}
      </FormField>
      <FormField label="Email" required hint="We'll never share your email">
        {(props) => (
          <input
            {...props}
            type="email"
            className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
            placeholder="you@example.com"
          />
        )}
      </FormField>
      <FormField label="Bio" hint="Tell us about yourself">
        {(props) => (
          <textarea
            {...props}
            rows={3}
            className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
            placeholder="I'm a software developer..."
          />
        )}
      </FormField>
    </form>
  ),
};
