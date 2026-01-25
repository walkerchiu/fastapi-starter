'use client';

import { forwardRef, useState, useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

export type CopyButtonSize = 'sm' | 'md' | 'lg';
export type CopyButtonVariant = 'default' | 'ghost' | 'outline';

export interface CopyButtonProps {
  value: string;
  onCopySuccess?: (value: string) => void;
  size?: CopyButtonSize;
  variant?: CopyButtonVariant;
  successDuration?: number;
  label?: string;
  successLabel?: string;
  disabled?: boolean;
  className?: string;
}

const sizeMap: Record<CopyButtonSize, 'small' | 'middle' | 'large'> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

const variantMap: Record<CopyButtonVariant, 'default' | 'text' | 'dashed'> = {
  default: 'default',
  ghost: 'text',
  outline: 'dashed',
};

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      onCopySuccess,
      size = 'md',
      variant = 'ghost',
      successDuration = 2000,
      label = 'Copy to clipboard',
      successLabel = 'Copied!',
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      if (disabled) return;

      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onCopySuccess?.(value);

        setTimeout(() => {
          setCopied(false);
        }, successDuration);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }, [value, disabled, onCopySuccess, successDuration]);

    return (
      <Tooltip title={copied ? successLabel : label}>
        <Button
          ref={ref}
          type={variantMap[variant]}
          size={sizeMap[size]}
          disabled={disabled}
          onClick={handleCopy}
          className={className}
          icon={
            copied ? (
              <CheckOutlined style={{ color: '#52c41a' }} />
            ) : (
              <CopyOutlined />
            )
          }
          aria-label={copied ? successLabel : label}
        />
      </Tooltip>
    );
  },
);

CopyButton.displayName = 'CopyButton';
