import { type ReactNode } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backHref,
  onBack,
  className,
}: PageHeaderProps) {
  const showBack = backHref || onBack;

  return (
    <Box className={className} sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((item, index) =>
            item.href ? (
              <MuiLink
                key={item.label}
                component={Link}
                href={item.href}
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                {item.label}
              </MuiLink>
            ) : (
              <Typography
                key={item.label}
                variant="body2"
                color={
                  index === breadcrumbs.length - 1
                    ? 'text.primary'
                    : 'text.secondary'
                }
              >
                {item.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Back Button */}
          {showBack &&
            (backHref ? (
              <IconButton
                component={Link}
                href={backHref}
                size="small"
                aria-label="Go back"
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            ) : (
              <IconButton
                onClick={onBack}
                size="small"
                aria-label="Go back"
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            ))}

          {/* Title and Description */}
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Actions */}
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
