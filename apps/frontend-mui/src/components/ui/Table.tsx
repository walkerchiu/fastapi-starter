'use client';

import React, { forwardRef, type HTMLAttributes } from 'react';
import MuiTable from '@mui/material/Table';
import MuiTableHead from '@mui/material/TableHead';
import MuiTableBody from '@mui/material/TableBody';
import MuiTableRow from '@mui/material/TableRow';
import MuiTableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ striped = false, className = '', children, ...props }, ref) => {
    return (
      <TableContainer>
        <MuiTable
          ref={ref}
          className={className}
          sx={
            striped
              ? {
                  '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': {
                    bgcolor: 'action.hover',
                  },
                }
              : undefined
          }
          {...props}
        >
          {children}
        </MuiTable>
      </TableContainer>
    );
  },
);

Table.displayName = 'Table';

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className = '', children, ...props }, ref) => {
  return (
    <MuiTableHead ref={ref} className={className} {...props}>
      {children}
    </MuiTableHead>
  );
});

TableHeader.displayName = 'TableHeader';

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <MuiTableBody ref={ref} className={className} {...props}>
        {children}
      </MuiTableBody>
    );
  },
);

TableBody.displayName = 'TableBody';

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ selected = false, className = '', children, ...props }, ref) => {
    return (
      <MuiTableRow
        ref={ref}
        selected={selected}
        hover
        className={className}
        aria-selected={selected ? true : undefined}
        {...props}
      >
        {children}
      </MuiTableRow>
    );
  },
);

TableRow.displayName = 'TableRow';

export type SortDirection = 'asc' | 'desc' | null;

type TableCellAlign = 'center' | 'left' | 'right' | 'inherit' | 'justify';

export interface TableHeadProps {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
  className?: string;
  children?: React.ReactNode;
  align?: TableCellAlign;
  colSpan?: number;
  rowSpan?: number;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      sortable = false,
      sortDirection,
      onSort,
      className = '',
      children,
      align,
      colSpan,
      rowSpan,
    },
    ref,
  ) => {
    return (
      <MuiTableCell
        ref={ref}
        className={className}
        sortDirection={sortDirection || false}
        sx={{ fontWeight: 600 }}
        align={align}
        colSpan={colSpan}
        rowSpan={rowSpan}
      >
        {sortable ? (
          <TableSortLabel
            active={!!sortDirection}
            direction={sortDirection || 'asc'}
            onClick={onSort}
          >
            {children}
          </TableSortLabel>
        ) : (
          children
        )}
      </MuiTableCell>
    );
  },
);

TableHead.displayName = 'TableHead';

export interface TableCellProps {
  className?: string;
  children?: React.ReactNode;
  align?: TableCellAlign;
  colSpan?: number;
  rowSpan?: number;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, align, colSpan, rowSpan }, ref) => {
    return (
      <MuiTableCell
        ref={ref}
        className={className}
        align={align}
        colSpan={colSpan}
        rowSpan={rowSpan}
      >
        {children}
      </MuiTableCell>
    );
  },
);

TableCell.displayName = 'TableCell';
