'use client';

import { type ReactNode, useCallback, useEffect, useId, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const sizeMap: Record<ModalSize, 'xs' | 'sm' | 'md' | 'lg'> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(
    (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (reason === 'backdropClick' && !closeOnOverlayClick) {
        return;
      }
      if (reason === 'escapeKeyDown' && !closeOnEscape) {
        return;
      }
      onClose();
    },
    [closeOnOverlayClick, closeOnEscape, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={sizeMap[size]}
      fullWidth
      aria-labelledby={title ? titleId : undefined}
    >
      {(title || showCloseButton) && (
        <DialogTitle
          id={titleId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: showCloseButton ? 1 : 3,
          }}
        >
          {title}
          {showCloseButton && (
            <IconButton
              aria-label="Close"
              onClick={onClose}
              size="small"
              sx={{ ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent>
        <Box ref={dialogRef} tabIndex={-1}>
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
