'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
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
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

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
        triggerId: `${baseId}-trigger`,
        contentId: `${baseId}-content`,
        triggerRef,
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
>(({ className = '', children, ...props }, ref) => {
  const { isOpen, setIsOpen, triggerId, contentId, triggerRef } =
    useDropdownMenuContext();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <button
      ref={(node) => {
        (
          triggerRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? contentId : undefined}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
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
    const { isOpen, setIsOpen, triggerId, contentId, triggerRef } =
      useDropdownMenuContext();
    const contentRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!isOpen || !triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentWidth = contentRef.current?.offsetWidth || 200;

      const top =
        side === 'bottom'
          ? triggerRect.bottom + sideOffset
          : triggerRect.top -
            (contentRef.current?.offsetHeight || 0) -
            sideOffset;

      let left =
        align === 'start' ? triggerRect.left : triggerRect.right - contentWidth;

      // Ensure content stays within viewport
      if (left < 8) left = 8;
      if (left + contentWidth > window.innerWidth - 8) {
        left = window.innerWidth - contentWidth - 8;
      }

      setPosition({ top, left });
    }, [isOpen, align, side, sideOffset, triggerRef]);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          contentRef.current &&
          !contentRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event: globalThis.KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, setIsOpen, triggerRef]);

    useEffect(() => {
      if (isOpen && contentRef.current) {
        const firstItem = contentRef.current.querySelector<HTMLElement>(
          '[role="menuitem"]:not([aria-disabled="true"])',
        );
        firstItem?.focus();
      }
    }, [isOpen]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([aria-disabled="true"])',
        ) || [],
      );
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          items[(currentIndex + 1) % items.length]?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          items[(currentIndex - 1 + items.length) % items.length]?.focus();
          break;
        case 'Home':
          event.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;
        case 'Tab':
          event.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    if (!isOpen || !mounted) return null;

    const baseStyles =
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-gray-700 dark:bg-gray-800';

    const content = (
      <div
        ref={(node) => {
          (
            contentRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        id={contentId}
        role="menu"
        aria-labelledby={triggerId}
        tabIndex={-1}
        className={[baseStyles, className].filter(Boolean).join(' ')}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
        }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );

    return createPortal(content, document.body);
  },
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

export interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
  children: ReactNode;
}

export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
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
    const { setIsOpen, triggerRef } = useDropdownMenuContext();

    const handleClick = () => {
      if (disabled) return;
      onSelect?.();
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect?.();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const baseStyles =
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 dark:focus:bg-gray-700';
    const disabledStyles = disabled ? 'pointer-events-none opacity-50' : '';
    const destructiveStyles = destructive
      ? 'text-red-600 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-900/20'
      : 'text-gray-700 dark:text-gray-200';

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={[baseStyles, disabledStyles, destructiveStyles, className]
          .filter(Boolean)
          .join(' ')}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="separator"
      className={['-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={[
        'px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuLabel.displayName = 'DropdownMenuLabel';
