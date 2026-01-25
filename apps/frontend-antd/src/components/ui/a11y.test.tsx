import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';

import { Alert } from './Alert';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { DropdownMenu } from './DropdownMenu';
import { FormField } from './FormField';
import { Input } from './Input';
import { Modal } from './Modal';
import { Pagination } from './Pagination';
import { RadioGroup } from './Radio';
import { Select } from './Select';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { StatCard } from './StatCard';
import { Table } from './Table';
import { Tabs } from './Tabs';
import { Tooltip } from './Tooltip';

expect.extend(toHaveNoViolations);

describe('UI Components A11y Tests', () => {
  describe('Alert', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Alert>Test alert message</Alert>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with different variants', async () => {
      const { container } = render(
        <>
          <Alert variant="info">Info alert</Alert>
          <Alert variant="success">Success alert</Alert>
          <Alert variant="warning">Warning alert</Alert>
          <Alert variant="error">Error alert</Alert>
        </>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Badge', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Badge>Test badge</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with different variants', async () => {
      const { container } = render(
        <>
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Button', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with different variants', async () => {
      const { container } = render(
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Card title="Card Title">Card content</Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Checkbox', () => {
    it('should have no accessibility violations with label', async () => {
      const { container } = render(
        <Checkbox id="test-checkbox">Test checkbox</Checkbox>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when checked', async () => {
      const { container } = render(
        <Checkbox id="checked-checkbox" checked onChange={() => {}}>
          Checked
        </Checkbox>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(
        <Checkbox id="disabled-checkbox" disabled>
          Disabled
        </Checkbox>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DropdownMenu', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <DropdownMenu
          trigger={<Button>Open Menu</Button>}
          items={[
            { key: '1', label: 'Item 1' },
            { key: '2', label: 'Item 2' },
          ]}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('FormField', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <FormField label="Username" name="username">
          <Input id="username" placeholder="Enter username" />
        </FormField>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with error state', async () => {
      const { container } = render(
        <FormField label="Email" name="email" error="Invalid email">
          <Input id="email" placeholder="Enter email" />
        </FormField>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with required field', async () => {
      const { container } = render(
        <FormField label="Password" name="password" required>
          <Input id="password" type="password" aria-label="Password" />
        </FormField>,
      );
      const results = await axe(container, {
        rules: {
          // Ant Design Form.Item has known issues with label-for association
          label: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input', () => {
    it('should have no accessibility violations with label', async () => {
      const { container } = render(
        <>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" placeholder="Enter text" />
        </>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with aria-label', async () => {
      const { container } = render(
        <Input aria-label="Search" placeholder="Search..." />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Modal', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Modal open={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Pagination', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Pagination
          current={1}
          pageSize={10}
          total={100}
          onChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('RadioGroup', () => {
    it('should have no accessibility violations', async () => {
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      const { container } = render(
        <RadioGroup
          label="Select an option"
          options={options}
          value="1"
          onChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with vertical direction', async () => {
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      const { container } = render(
        <RadioGroup
          label="Select an option"
          options={options}
          value="1"
          direction="vertical"
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Select', () => {
    it('should have no accessibility violations', async () => {
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      const { container } = render(
        <>
          <label htmlFor="test-select">Choose an option</label>
          <Select id="test-select" options={options} />
        </>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Skeleton', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Skeleton />);
      // Ant Design Skeleton uses empty h3 elements which trigger empty-heading rule
      const results = await axe(container, {
        rules: {
          'empty-heading': { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with different variants', async () => {
      const { container } = render(
        <>
          <Skeleton variant="text" />
          <Skeleton variant="circular" />
          <Skeleton variant="rectangular" />
        </>,
      );
      // Ant Design Skeleton uses empty h3 elements which trigger empty-heading rule
      const results = await axe(container, {
        rules: {
          'empty-heading': { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Spinner', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Spinner aria-label="Loading" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('StatCard', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <StatCard title="Total Users" value="1,234" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Table', () => {
    it('should have no accessibility violations', async () => {
      const columns = [
        { key: 'name', title: 'Name', dataIndex: 'name' },
        { key: 'email', title: 'Email', dataIndex: 'email' },
      ];
      const data = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
      ];
      const { container } = render(
        <Table columns={columns} data={data} rowKey="id" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tabs', () => {
    it('should have no accessibility violations', async () => {
      const items = [
        { key: 'tab1', label: 'Tab 1', children: <div>Content 1</div> },
        { key: 'tab2', label: 'Tab 2', children: <div>Content 2</div> },
      ];
      const { container } = render(
        <Tabs items={items} defaultActiveKey="tab1" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tooltip', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Tooltip content="Tooltip text">
          <Button>Hover me</Button>
        </Tooltip>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
