'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue'
> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue = '',
      value: controlledValue,
      onValueChange,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const baseId = useId();

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleValueChange = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange],
    );

    return (
      <TabsContext.Provider
        value={{ value, onValueChange: handleValueChange, baseId }}
      >
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = 'Tabs';

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800';

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.getAttribute('role') !== 'tab') return;

        const tabs = Array.from(
          (event.currentTarget as HTMLElement).querySelectorAll('[role="tab"]'),
        ) as HTMLButtonElement[];
        const currentIndex = tabs.indexOf(target as HTMLButtonElement);

        let nextIndex: number | null = null;

        switch (event.key) {
          case 'ArrowLeft':
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            break;
          case 'ArrowRight':
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            break;
          case 'Home':
            nextIndex = 0;
            break;
          case 'End':
            nextIndex = tabs.length - 1;
            break;
        }

        if (nextIndex !== null) {
          const nextTab = tabs[nextIndex];
          if (nextTab) {
            event.preventDefault();
            nextTab.focus();
            nextTab.click();
          }
        }
      },
      [],
    );

    return (
      <div
        ref={ref}
        role="tablist"
        className={[baseStyles, className].filter(Boolean).join(' ')}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  'onClick'
> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, disabled = false, className = '', children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, baseId } = useTabsContext();
    const isSelected = selectedValue === value;

    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50';
    const selectedStyles = isSelected
      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-50'
      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50';

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        id={`${baseId}-trigger-${value}`}
        aria-selected={isSelected}
        aria-controls={`${baseId}-content-${value}`}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        className={[baseStyles, selectedStyles, className]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
  children: ReactNode;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, forceMount = false, className = '', children, ...props }, ref) => {
    const { value: selectedValue, baseId } = useTabsContext();
    const isSelected = selectedValue === value;

    if (!isSelected && !forceMount) {
      return null;
    }

    const baseStyles =
      'mt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-content-${value}`}
        aria-labelledby={`${baseId}-trigger-${value}`}
        tabIndex={0}
        hidden={!isSelected}
        className={[baseStyles, className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TabsContent.displayName = 'TabsContent';
