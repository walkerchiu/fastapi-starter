import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Button as AntButton, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const sizeMap: Record<ButtonSize, 'small' | 'middle' | 'large'> = {
  sm: 'small',
  md: 'middle',
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
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const getAntButtonType = () => {
      switch (variant) {
        case 'primary':
          return 'primary';
        case 'secondary':
          return 'default';
        case 'outline':
          return 'default';
        case 'ghost':
          return 'text';
        case 'danger':
          return 'primary';
        default:
          return 'primary';
      }
    };

    const isDanger = variant === 'danger';
    const isGhost = variant === 'outline';

    return (
      <AntButton
        ref={ref}
        type={getAntButtonType()}
        size={sizeMap[size]}
        disabled={disabled || loading}
        block={fullWidth}
        danger={isDanger}
        ghost={isGhost}
        htmlType={type as 'button' | 'submit' | 'reset'}
        className={className}
        onClick={onClick}
        icon={
          loading ? (
            <Spin
              indicator={
                <LoadingOutlined
                  style={{
                    fontSize: size === 'sm' ? 14 : size === 'lg' ? 20 : 16,
                  }}
                />
              }
              size="small"
            />
          ) : undefined
        }
        {...props}
      >
        {children}
      </AntButton>
    );
  },
);

Button.displayName = 'Button';
