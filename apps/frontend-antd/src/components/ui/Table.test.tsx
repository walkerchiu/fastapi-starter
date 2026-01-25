import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Table } from './Table';

const columns = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'email', title: 'Email', dataIndex: 'email' },
  { key: 'role', title: 'Role', dataIndex: 'role' },
];

const data = [
  { key: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { key: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

describe('Table', () => {
  it('renders table correctly', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Table columns={columns} data={data} loading />);
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<Table columns={columns} data={[]} />);
    // Ant Design shows "No data" in both the image title and description
    const emptyDescription = document.querySelector('.ant-empty-description');
    expect(emptyDescription).toHaveTextContent('No data');
  });
});
