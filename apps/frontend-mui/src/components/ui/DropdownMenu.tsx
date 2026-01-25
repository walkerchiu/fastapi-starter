'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';

interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      'DropdownMenu components must be used within a DropdownMenu provider',
    );
  }
  return context;
}

export interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DropdownMenuContext.Provider
      value={{
        isOpen,
        setIsOpen,
        anchorEl,
        setAnchorEl,
      }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
}

DropdownMenu.displayName = 'DropdownMenu';

export interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className = '', children, color: _color, ...props }, ref) => {
  const { isOpen, setIsOpen, setAnchorEl } = useDropdownMenuContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(!isOpen);
  };

  return (
    <Button
      ref={ref}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={handleClick}
      className={className}
      color="inherit"
      {...props}
    >
      {children}
    </Button>
  );
});

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export type DropdownMenuAlign = 'start' | 'end';
export type DropdownMenuSide = 'top' | 'bottom';

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: DropdownMenuAlign;
  side?: DropdownMenuSide;
  sideOffset?: number;
  children: ReactNode;
}

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(
  (
    {
      align = 'start',
      side = 'bottom',
      sideOffset = 4,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const { isOpen, setIsOpen, anchorEl, setAnchorEl } =
      useDropdownMenuContext();

    const handleClose = () => {
      setIsOpen(false);
      setAnchorEl(null);
    };

    const anchorOrigin = {
      vertical: (side === 'bottom' ? 'bottom' : 'top') as 'bottom' | 'top',
      horizontal: (align === 'start' ? 'left' : 'right') as 'left' | 'right',
    };

    const transformOrigin = {
      vertical: (side === 'bottom' ? 'top' : 'bottom') as 'top' | 'bottom',
      horizontal: (align === 'start' ? 'left' : 'right') as 'left' | 'right',
    };

    return (
      <Menu
        ref={ref}
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        className={className}
        slotProps={{
          paper: {
            sx: { mt: side === 'bottom' ? `${sideOffset}px` : undefined },
          },
        }}
        {...props}
      >
        {children}
      </Menu>
    );
  },
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

export interface DropdownMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
  children: ReactNode;
}

export const DropdownMenuItem = forwardRef<
  HTMLLIElement,
  DropdownMenuItemProps
>(
  (
    {
      disabled = false,
      destructive = false,
      onSelect,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const { setIsOpen, setAnchorEl } = useDropdownMenuContext();

    const handleClick = () => {
      if (disabled) return;
      onSelect?.();
      setIsOpen(false);
      setAnchorEl(null);
    };

    return (
      <MenuItem
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={className}
        sx={{
          color: destructive ? 'error.main' : undefined,
          '&:hover': {
            bgcolor: destructive ? 'error.light' : undefined,
          },
        }}
        {...props}
      >
        <ListItemText>{children}</ListItemText>
      </MenuItem>
    );
  },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLHRElement>;

export const DropdownMenuSeparator = forwardRef<
  HTMLHRElement,
  DropdownMenuSeparatorProps
>(({ className = '', ...props }, ref) => {
  return <Divider ref={ref} className={className} {...props} />;
});

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export interface DropdownMenuLabelProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

export const DropdownMenuLabel = forwardRef<
  HTMLLIElement,
  DropdownMenuLabelProps
>(({ className = '', children, ...props }, ref) => {
  return (
    <MenuItem ref={ref} disabled className={className} {...props}>
      <Typography variant="body2" fontWeight={600}>
        {children}
      </Typography>
    </MenuItem>
  );
});

DropdownMenuLabel.displayName = 'DropdownMenuLabel';
