import React, { forwardRef } from 'react';
import { Select as AntSelect } from 'antd';
import type { RefSelectProps } from 'antd/es/select';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  size?: SelectSize;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  id?: string;
  name?: string;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  filterOption?: (input: string, option: SelectOption | undefined) => boolean;
}

const sizeMap: Record<SelectSize, 'small' | 'middle' | 'large'> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

export const Select = forwardRef<RefSelectProps, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      placeholder,
      size = 'md',
      disabled,
      loading,
      allowClear,
      showSearch,
      onChange,
      onSearch,
      className,
      id,
      fullWidth = false,
      style,
      filterOption,
    },
    ref,
  ) => {
    return (
      <AntSelect
        ref={ref}
        options={options}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        size={sizeMap[size]}
        disabled={disabled}
        loading={loading}
        allowClear={allowClear}
        showSearch={showSearch}
        onChange={onChange}
        onSearch={onSearch}
        className={className}
        id={id}
        style={style ?? (fullWidth ? { width: '100%' } : undefined)}
        filterOption={
          filterOption ??
          (showSearch
            ? (input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
            : undefined)
        }
      />
    );
  },
);

Select.displayName = 'Select';
