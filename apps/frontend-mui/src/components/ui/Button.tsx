import { type ButtonHTMLAttributes, forwardRef } from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantMap: Record<ButtonVariant, 'contained' | 'outlined' | 'text'> = {
  primary: 'contained',
  secondary: 'contained',
  outline: 'outlined',
  ghost: 'text',
  danger: 'contained',
};

type MuiButtonColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warning';

function getButtonColor(variant: ButtonVariant): MuiButtonColor {
  const colorMap: Record<ButtonVariant, MuiButtonColor> = {
    primary: 'primary',
    secondary: 'secondary',
    outline: 'inherit',
    ghost: 'inherit',
    danger: 'error',
  };
  return colorMap[variant];
}

const sizeMap: Record<ButtonSize, 'small' | 'medium' | 'large'> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <MuiButton
        ref={ref}
        variant={variantMap[variant]}
        color={getButtonColor(variant)}
        size={sizeMap[size]}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        type={type}
        startIcon={
          loading ? (
            <CircularProgress
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
              color="inherit"
            />
          ) : undefined
        }
        className={props.className}
        onClick={props.onClick}
      >
        {children}
      </MuiButton>
    );
  },
);

Button.displayName = 'Button';
