'use client';

import { type ReactNode, useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../ui/Table';
import { Checkbox } from '../ui/Checkbox';
import { Skeleton } from '../ui/Skeleton';
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

function SortIcon({ direction }: { direction?: 'asc' | 'desc' }) {
  if (!direction) {
    return (
      <svg
        className="ml-1 h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }

  return (
    <svg
      className={`ml-1 h-4 w-4 ${direction === 'desc' ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
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
  className = '',
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

  const showSelection =
    onRowSelectionChange !== undefined || rowSelection !== undefined;

  // Skeleton rows for loading state
  const skeletonRows = useMemo(
    () =>
      Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {showSelection && (
            <TableCell className="w-12">
              <Skeleton className="h-4 w-4" />
            </TableCell>
          )}
          {columns.map((col) => (
            <TableCell key={col.key}>
              <Skeleton className="h-4 w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      )),
    [columns, pagination?.pageSize, showSelection],
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {toolbar}

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.className}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="flex items-center font-semibold hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      <SortIcon
                        direction={
                          currentSorting?.key === column.key
                            ? currentSorting.direction
                            : undefined
                        }
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              skeletonRows
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showSelection ? 1 : 0)}
                  className="h-40"
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
                    className={`
                      ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
                      ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
                    `}
                    onClick={() => onRowClick?.(row)}
                  >
                    {showSelection && (
                      <TableCell
                        className="w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected || false}
                          onChange={(e) =>
                            handleSelectRow(rowKey, e.target.checked)
                          }
                          aria-label={`Select row ${rowKey}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
