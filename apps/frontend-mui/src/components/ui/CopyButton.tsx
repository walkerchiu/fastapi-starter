'use client';

import { forwardRef, useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Tooltip from '@mui/material/Tooltip';

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

const sizeMap: Record<CopyButtonSize, 'small' | 'medium' | 'large'> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

const iconSizeMap: Record<CopyButtonSize, 'small' | 'medium' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'medium',
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

    const getVariantStyles = () => {
      switch (variant) {
        case 'default':
          return {
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
          };
        case 'outline':
          return {
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          };
        case 'ghost':
        default:
          return {
            '&:hover': { bgcolor: 'action.hover' },
          };
      }
    };

    return (
      <Tooltip title={copied ? successLabel : label}>
        <span>
          <IconButton
            ref={ref}
            onClick={handleCopy}
            disabled={disabled}
            size={sizeMap[size]}
            className={className}
            sx={{
              ...getVariantStyles(),
              color: copied ? 'success.main' : 'text.secondary',
            }}
            aria-label={copied ? successLabel : label}
          >
            {copied ? (
              <CheckIcon fontSize={iconSizeMap[size]} />
            ) : (
              <ContentCopyIcon fontSize={iconSizeMap[size]} />
            )}
          </IconButton>
        </span>
      </Tooltip>
    );
  },
);

CopyButton.displayName = 'CopyButton';
