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
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
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
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <Box ref={ref} className={className} {...props}>
          {children}
        </Box>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = 'Tabs';

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = '', children }, ref) => {
    const { value, onValueChange } = useTabsContext();

    return (
      <MuiTabs
        ref={ref}
        value={value}
        onChange={(_, newValue) => onValueChange(newValue)}
        className={className}
        sx={{
          minHeight: 40,
          '& .MuiTabs-indicator': {
            height: 3,
          },
        }}
      >
        {children}
      </MuiTabs>
    );
  },
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export const TabsTrigger = forwardRef<HTMLDivElement, TabsTriggerProps>(
  ({ value, disabled = false, className = '', children }, ref) => {
    return (
      <MuiTab
        ref={ref}
        value={value}
        label={children}
        disabled={disabled}
        className={className}
        sx={{
          minHeight: 40,
          textTransform: 'none',
          fontWeight: 500,
        }}
      />
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
    const { value: selectedValue } = useTabsContext();
    const isSelected = selectedValue === value;

    if (!isSelected && !forceMount) {
      return null;
    }

    return (
      <Box
        ref={ref}
        role="tabpanel"
        hidden={!isSelected}
        className={className}
        sx={{ mt: 2 }}
        tabIndex={0}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

TabsContent.displayName = 'TabsContent';
