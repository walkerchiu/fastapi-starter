'use client';

import type { ReactNode } from 'react';
import { Alert, message, notification } from 'antd';
import type { ArgsProps as MessageArgsProps } from 'antd/es/message';
import type { ArgsProps as NotificationArgsProps } from 'antd/es/notification';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

// Static Toast component for visual display (used in Storybook)
export interface ToastComponentProps {
  variant?: ToastVariant;
  children: ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

export function Toast({
  variant = 'info',
  children,
  closable = false,
  onClose,
}: ToastComponentProps) {
  return (
    <Alert
      type={variant}
      message={children}
      closable={closable}
      onClose={onClose}
      showIcon
      style={{ marginBottom: 8 }}
    />
  );
}

export interface ToastProps {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

// Simple toast (uses message API)
export function toast({
  message: content,
  variant = 'info',
  duration = 3,
}: Omit<ToastProps, 'description' | 'placement'>) {
  const config: MessageArgsProps = {
    content,
    duration,
  };

  switch (variant) {
    case 'success':
      message.success(config);
      break;
    case 'warning':
      message.warning(config);
      break;
    case 'error':
      message.error(config);
      break;
    default:
      message.info(config);
  }
}

// Notification toast with description (uses notification API)
export function notify({
  message: title,
  description,
  variant = 'info',
  duration = 4.5,
  placement = 'topRight',
}: ToastProps) {
  const config: NotificationArgsProps = {
    message: title,
    description,
    duration,
    placement,
  };

  switch (variant) {
    case 'success':
      notification.success(config);
      break;
    case 'warning':
      notification.warning(config);
      break;
    case 'error':
      notification.error(config);
      break;
    default:
      notification.info(config);
  }
}

// Hook for using toast in components (useful for accessing Ant Design's App context)
export function useToast() {
  return {
    toast,
    notify,
    success: (content: string, duration?: number) =>
      toast({ message: content, variant: 'success', duration }),
    error: (content: string, duration?: number) =>
      toast({ message: content, variant: 'error', duration }),
    warning: (content: string, duration?: number) =>
      toast({ message: content, variant: 'warning', duration }),
    info: (content: string, duration?: number) =>
      toast({ message: content, variant: 'info', duration }),
  };
}
