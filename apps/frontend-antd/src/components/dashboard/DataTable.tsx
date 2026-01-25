'use client';

import React, { type ReactNode, useState, useMemo } from 'react';
import { Table, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Checkbox } from '../ui/Checkbox';
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
  className,
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

  // Convert columns to Ant Design format
  const antColumns: ColumnsType<T> = useMemo(() => {
    const cols: ColumnsType<T> = [];

    if (showSelection) {
      cols.push({
        key: '_selection',
        width: 48,
        title: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={handleSelectAll}
          />
        ),
        render: (_: unknown, record: T) => {
          const rowKey = getRowKey(record);
          return (
            <span onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <Checkbox
                checked={currentSelection[rowKey] || false}
                onChange={(checked) => handleSelectRow(rowKey, checked)}
              />
            </span>
          );
        },
      });
    }

    columns.forEach((column) => {
      cols.push({
        key: column.key,
        dataIndex: column.key,
        title: column.sortable ? (
          <button
            type="button"
            onClick={() => handleSort(column.key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {column.header}
            {currentSorting?.key === column.key && (
              <span>{currentSorting.direction === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        ) : (
          column.header
        ),
        width: column.width,
        className: column.className,
        render: (_: unknown, record: T) => column.cell(record),
        sorter: column.sortable,
        sortOrder:
          currentSorting?.key === column.key
            ? currentSorting.direction === 'asc'
              ? 'ascend'
              : 'descend'
            : undefined,
      });
    });

    return cols;
  }, [
    columns,
    showSelection,
    allSelected,
    someSelected,
    currentSorting,
    currentSelection,
  ]);

  // Loading skeleton
  const skeletonData = useMemo(
    () =>
      Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => ({
        _key: `skeleton-${index}`,
      })) as T[],
    [pagination?.pageSize],
  );

  const skeletonColumns: ColumnsType<T> = useMemo(
    () =>
      columns.map((col) => ({
        key: col.key,
        dataIndex: col.key,
        title: col.header,
        width: col.width,
        render: () => (
          <Skeleton.Input active size="small" style={{ width: '75%' }} />
        ),
      })),
    [columns],
  );

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {toolbar}

      <Table<T>
        columns={loading ? skeletonColumns : antColumns}
        dataSource={loading ? skeletonData : data}
        rowKey={loading ? ('_key' as keyof T) : getRowKey}
        pagination={false}
        onRow={
          onRowClick && !loading
            ? (record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: 'pointer' },
              })
            : undefined
        }
        locale={{
          emptyText: emptyState || (
            <EmptyState
              title="No data"
              description="There are no items to display."
            />
          ),
        }}
        rowClassName={(record) => {
          if (loading) return '';
          const rowKey = getRowKey(record);
          return currentSelection[rowKey] ? 'ant-table-row-selected' : '';
        }}
      />

      {pagination && onPaginationChange && !loading && (
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
