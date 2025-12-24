import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';

import { Alert } from './Alert';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardHeader, CardBody } from './Card';
import { Checkbox } from './Checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './DropdownMenu';
import { FormField } from './FormField';
import { Input } from './Input';
import { Modal } from './Modal';
import { Pagination } from './Pagination';
import { Radio, RadioGroup } from './Radio';
import { Select } from './Select';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import { StatCard } from './StatCard';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from './Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { ToastProvider } from './Toast';
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
          <Badge variant="neutral">Neutral</Badge>
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
        <Card>
          <CardHeader>Header</CardHeader>
          <CardBody>Content</CardBody>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Checkbox', () => {
    it('should have no accessibility violations with label', async () => {
      const { container } = render(
        <Checkbox id="test-checkbox" label="Test checkbox" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when checked', async () => {
      const { container } = render(
        <Checkbox
          id="checked-checkbox"
          label="Checked"
          checked
          onChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(
        <Checkbox id="disabled-checkbox" label="Disabled" disabled />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DropdownMenu', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('FormField', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <FormField label="Username" id="username">
          {(props) => <Input {...props} placeholder="Enter username" />}
        </FormField>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with error state', async () => {
      const { container } = render(
        <FormField label="Email" id="email" error="Invalid email">
          {(props) => <Input {...props} placeholder="Enter email" />}
        </FormField>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with required field', async () => {
      const { container } = render(
        <FormField label="Password" id="password" required>
          {(props) => <Input {...props} type="password" />}
        </FormField>,
      );
      const results = await axe(container);
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
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
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
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Radio', () => {
    it('should have no accessibility violations with RadioGroup', async () => {
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      const { container } = render(
        <RadioGroup
          name="options"
          label="Select an option"
          options={options}
          value="1"
          onChange={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with individual Radio', async () => {
      const { container } = render(
        <fieldset>
          <legend>Select an option</legend>
          <Radio id="option1" name="options" label="Option 1" value="1" />
          <Radio id="option2" name="options" label="Option 2" value="2" />
        </fieldset>,
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
      const results = await axe(container);
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
      const results = await axe(container);
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
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tabs', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ToastProvider', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ToastProvider>
          <div>App content</div>
        </ToastProvider>,
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
