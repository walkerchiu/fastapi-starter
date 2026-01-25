import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MultiSelect } from './MultiSelect';

const meta: Meta<typeof MultiSelect> = {
  title: 'UI/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Select frameworks...',
  },
};

export const Controlled: Story = {
  render: function ControlledMultiSelect() {
    const [value, setValue] = useState<string[]>(['react', 'vue']);
    return (
      <div className="space-y-4">
        <MultiSelect
          options={defaultOptions}
          value={value}
          onChange={setValue}
          placeholder="Select frameworks..."
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {value.join(', ') || 'None'}
        </p>
      </div>
    );
  },
};

export const Searchable: Story = {
  args: {
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
      { value: 'jp', label: 'Japan' },
      { value: 'cn', label: 'China' },
      { value: 'br', label: 'Brazil' },
      { value: 'in', label: 'India' },
    ],
    placeholder: 'Search countries...',
    searchable: true,
  },
};

export const WithMaxItems: Story = {
  render: function MaxItemsMultiSelect() {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="space-y-4">
        <MultiSelect
          options={defaultOptions}
          value={value}
          onChange={setValue}
          placeholder="Select up to 3..."
          maxItems={3}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {value.length}/3 selected
        </p>
      </div>
    );
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Technologies',
    options: defaultOptions,
    placeholder: 'Select technologies...',
    hint: 'Choose the technologies you work with',
  },
};

export const WithError: Story = {
  args: {
    label: 'Required Field',
    options: defaultOptions,
    placeholder: 'Select at least one...',
    error: 'Please select at least one option',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    options: defaultOptions,
    value: ['react', 'vue'],
    disabled: true,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue', disabled: true },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte', disabled: true },
      { value: 'solid', label: 'Solid' },
    ],
    placeholder: 'Some options are disabled...',
  },
};
