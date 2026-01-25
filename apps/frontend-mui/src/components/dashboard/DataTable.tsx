'use client';

import { type ReactNode, useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Skeleton,
  Paper,
} from '@mui/material';
import { EmptyState } from './EmptyState';
import { DataTablePagination } from './DataTablePagination';

export interface ColumnDef<T> {
  key: string;
  header: string | ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  className?: string;
}

export interface SortingState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState | undefined) => void;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  emptyState,
  toolbar,
}: DataTableProps<T>) {
  const [internalSorting, setInternalSorting] = useState<
    SortingState | undefined
  >();
  const [internalSelection, setInternalSelection] = useState<
    Record<string, boolean>
  >({});

  const currentSorting = sorting ?? internalSorting;
  const currentSelection = rowSelection ?? internalSelection;

  const handleSort = (key: string) => {
    const newSorting: SortingState | undefined =
      currentSorting?.key === key
        ? currentSorting.direction === 'asc'
          ? { key, direction: 'desc' }
          : undefined
        : { key, direction: 'asc' };

    if (onSortingChange) {
      onSortingChange(newSorting);
    } else {
      setInternalSorting(newSorting);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    if (checked) {
      data.forEach((row) => {
        newSelection[getRowKey(row)] = true;
      });
    }
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelection);
    } else {
      setInternalSelection(newSelection);
    }
  };

  const handleSelectRow = (rowKey: string, checked: boolean) => {
    const newSelection = { ...currentSelection };
    if (checked) {
      newSelection[rowKey] = true;
    } else {
      delete newSelection[rowKey];
    }
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelection);
    } else {
      setInternalSelection(newSelection);
    }
  };

  const selectedCount = Object.keys(currentSelection).length;
  const allSelected = data.length > 0 && selectedCount === data.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const showSelection =
    onRowSelectionChange !== undefined || rowSelection !== undefined;

  // Skeleton rows for loading state
  const skeletonRows = useMemo(
    () =>
      Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {showSelection && (
            <TableCell padding="checkbox">
              <Skeleton variant="rectangular" width={18} height={18} />
            </TableCell>
          )}
          {columns.map((col) => (
            <TableCell key={col.key}>
              <Skeleton variant="text" width="75%" />
            </TableCell>
          ))}
        </TableRow>
      )),
    [columns, pagination?.pageSize, showSelection],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {toolbar}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 1 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {showSelection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    inputProps={{ 'aria-label': 'Select all rows' }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{ width: column.width, fontWeight: 600 }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={currentSorting?.key === column.key}
                      direction={
                        currentSorting?.key === column.key
                          ? currentSorting.direction
                          : 'asc'
                      }
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              skeletonRows
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showSelection ? 1 : 0)}
                  sx={{ height: 160 }}
                >
                  {emptyState || (
                    <EmptyState
                      title="No data"
                      description="There are no items to display."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowKey = getRowKey(row);
                const isSelected = currentSelection[rowKey];

                return (
                  <TableRow
                    key={rowKey}
                    hover={!!onRowClick}
                    selected={isSelected}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                  >
                    {showSelection && (
                      <TableCell
                        padding="checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected || false}
                          onChange={(e) =>
                            handleSelectRow(rowKey, e.target.checked)
                          }
                          inputProps={{ 'aria-label': `Select row ${rowKey}` }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>{column.cell(row)}</TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && onPaginationChange && (
        <DataTablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={(page) => onPaginationChange({ ...pagination, page })}
          onPageSizeChange={(pageSize) =>
            onPaginationChange({ ...pagination, pageSize, page: 1 })
          }
        />
      )}
    </Box>
  );
}
