import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback } from 'react';
import { Combobox } from './Combobox';

const meta: Meta<typeof Combobox> = {
  title: 'UI/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
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
    placeholder: 'Search frameworks...',
  },
};

export const Controlled: Story = {
  render: function ControlledCombobox() {
    const [value, setValue] = useState<string>('react');
    return (
      <div className="space-y-4">
        <Combobox
          options={defaultOptions}
          value={value}
          onChange={setValue}
          placeholder="Search frameworks..."
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {value || 'None'}
        </p>
      </div>
    );
  },
};

export const AsyncSearch: Story = {
  render: function AsyncSearchCombobox() {
    const [value, setValue] = useState<string>('');
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
      [],
    );
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback((query: string) => {
      if (!query) {
        setOptions([]);
        return;
      }

      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const allOptions = [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
          { value: 'de', label: 'Germany' },
          { value: 'fr', label: 'France' },
        ];
        const filtered = allOptions.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        );
        setOptions(filtered);
        setLoading(false);
      }, 500);
    }, []);

    return (
      <div className="space-y-4">
        <Combobox
          options={options}
          value={value}
          onChange={setValue}
          onSearch={handleSearch}
          loading={loading}
          placeholder="Search countries..."
          emptyMessage="Type to search countries"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {value || 'None'}
        </p>
      </div>
    );
  },
};

export const Loading: Story = {
  args: {
    options: [],
    placeholder: 'Search...',
    loading: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    placeholder: 'Select a framework...',
    hint: 'Choose your preferred framework',
  },
};

export const WithError: Story = {
  args: {
    label: 'Required Field',
    options: defaultOptions,
    placeholder: 'Select an option...',
    error: 'Please select an option',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Combobox',
    options: defaultOptions,
    value: 'react',
    disabled: true,
  },
};
