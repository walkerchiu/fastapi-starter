import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

describe('Table', () => {
  it('renders a table element', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Table className="custom-class">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole('table')).toHaveClass('custom-class');
  });
});

describe('TableHeader', () => {
  it('renders thead element', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Header' }),
    ).toBeInTheDocument();
  });
});

describe('TableHead', () => {
  const mockOnSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders non-sortable header by default', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    const header = screen.getByRole('columnheader', { name: 'Name' });
    expect(header).not.toHaveAttribute('tabindex');
  });

  it('renders sortable header with sort indicators', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable onSort={mockOnSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    const header = screen.getByRole('columnheader', { name: 'Name' });
    expect(header).toHaveAttribute('tabindex', '0');
  });

  it('calls onSort when clicking sortable header', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable onSort={mockOnSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }));
    expect(mockOnSort).toHaveBeenCalledTimes(1);
  });

  it('calls onSort when pressing Enter on sortable header', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable onSort={mockOnSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    fireEvent.keyDown(screen.getByRole('columnheader', { name: 'Name' }), {
      key: 'Enter',
    });
    expect(mockOnSort).toHaveBeenCalledTimes(1);
  });

  it('calls onSort when pressing Space on sortable header', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable onSort={mockOnSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    fireEvent.keyDown(screen.getByRole('columnheader', { name: 'Name' }), {
      key: ' ',
    });
    expect(mockOnSort).toHaveBeenCalledTimes(1);
  });

  it('sets aria-sort to ascending when sortDirection is asc', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="asc" onSort={mockOnSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });

  it('sets aria-sort to descending when sortDirection is desc', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="desc" onSort={mockOnSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });
});

describe('TableRow', () => {
  it('renders tr element', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByTestId('row')).toBeInTheDocument();
  });

  it('applies selected styles when selected', () => {
    render(
      <Table>
        <TableBody>
          <TableRow selected data-testid="row">
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByTestId('row')).toHaveAttribute('aria-selected', 'true');
  });

  it('applies custom className', () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="custom-row" data-testid="row">
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByTestId('row')).toHaveClass('custom-row');
  });
});

describe('TableCell', () => {
  it('renders td element with content', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(
      screen.getByRole('cell', { name: 'Cell Content' }),
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="custom-cell">Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole('cell', { name: 'Content' })).toHaveClass(
      'custom-cell',
    );
  });
});

describe('Table Integration', () => {
  it('renders a complete table with all components', () => {
    render(
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
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header row + 2 body rows
    expect(screen.getAllByRole('cell')).toHaveLength(4);
  });
});
