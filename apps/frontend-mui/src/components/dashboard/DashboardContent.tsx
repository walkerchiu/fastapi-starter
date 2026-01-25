import { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export interface DashboardContentProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const paddingMap: Record<
  NonNullable<DashboardContentProps['padding']>,
  number | { xs: number; md: number }
> = {
  none: 0,
  sm: { xs: 1, md: 2 },
  md: { xs: 2, md: 3 },
  lg: { xs: 3, md: 4 },
};

const maxWidthMap: Record<
  NonNullable<DashboardContentProps['maxWidth']>,
  'sm' | 'md' | 'lg' | 'xl' | false
> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': 'xl',
  full: false,
};

export function DashboardContent({
  children,
  padding = 'md',
  maxWidth = 'full',
  className,
}: DashboardContentProps) {
  const paddingValue = paddingMap[padding];
  const maxWidthValue = maxWidthMap[maxWidth];

  return (
    <Box
      component="main"
      className={className}
      sx={{
        flex: 1,
        p: paddingValue,
      }}
    >
      {maxWidthValue === false ? (
        <Box sx={{ width: '100%' }}>{children}</Box>
      ) : (
        <Container maxWidth={maxWidthValue} disableGutters>
          {children}
        </Container>
      )}
    </Box>
  );
}
