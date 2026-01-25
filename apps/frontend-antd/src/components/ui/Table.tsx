import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps, ColumnsType } from 'antd/es/table';

export interface TableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T | string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
  fixed?: 'left' | 'right';
}

export interface TableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => string);
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRowClick?: (record: T) => void;
  className?: string;
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  scroll?: { x?: number | string; y?: number | string };
}

export function Table<T extends object>({
  columns,
  data,
  loading,
  rowKey = 'id' as keyof T,
  pagination,
  onRowClick,
  className,
  bordered = false,
  size = 'middle',
  scroll,
}: TableProps<T>) {
  const antColumns: ColumnsType<T> = columns.map((col) => ({
    key: col.key,
    title: col.title,
    dataIndex: col.dataIndex as string,
    render: col.render,
    width: col.width,
    align: col.align,
    sorter: col.sorter,
    fixed: col.fixed,
  }));

  const tableProps: AntTableProps<T> = {
    columns: antColumns,
    dataSource: data,
    loading,
    rowKey: rowKey as string | ((record: T) => string),
    pagination: pagination
      ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: pagination.onChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} items`,
        }
      : false,
    onRow: onRowClick
      ? (record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: 'pointer' },
        })
      : undefined,
    className,
    bordered,
    size,
    scroll,
  };

  return <AntTable<T> {...tableProps} />;
}
