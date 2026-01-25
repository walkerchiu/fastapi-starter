import { type ReactNode } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';

export interface DashboardFooterProps {
  children?: ReactNode;
  copyright?: string;
  links?: Array<{ label: string; href: string }>;
  className?: string;
}

export function DashboardFooter({
  children,
  copyright,
  links,
  className,
}: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} Company. All rights reserved.`;

  if (children) {
    return (
      <Box
        component="footer"
        className={className}
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 2,
          py: 2,
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      className={className}
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: 2,
        py: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {copyright || defaultCopyright}
        </Typography>
        {links && links.length > 0 && (
          <Box
            component="nav"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {links.map((link) => (
              <MuiLink
                key={link.href}
                component={Link}
                href={link.href}
                variant="body2"
                color="text.secondary"
                underline="hover"
              >
                {link.label}
              </MuiLink>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
