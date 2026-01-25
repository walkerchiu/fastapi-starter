import { type ReactNode } from 'react';
import { Modal as AntModal } from 'antd';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  className?: string;
}

const sizeMap: Record<ModalSize, number> = {
  sm: 400,
  md: 520,
  lg: 720,
  xl: 1000,
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  maskClosable = true,
  centered = true,
  className,
}: ModalProps) {
  return (
    <AntModal
      open={open}
      onCancel={onClose}
      title={title}
      footer={footer}
      width={sizeMap[size]}
      closable={closable}
      maskClosable={maskClosable}
      centered={centered}
      className={className}
      destroyOnClose
    >
      {children}
    </AntModal>
  );
}
