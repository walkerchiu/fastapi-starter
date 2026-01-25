'use client';

import { useState, type ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: PageSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const hasHeader = title || description || actions;

  return (
    <Card className={className} variant="outlined">
      {hasHeader && (
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {collapsible && (
                <IconButton
                  onClick={() => setCollapsed(!collapsed)}
                  size="small"
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? 'Expand section' : 'Collapse section'}
                  sx={{
                    transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              )}
              {title && (
                <Typography variant="h6" component="h2">
                  {title}
                </Typography>
              )}
            </Box>
          }
          subheader={description}
          action={actions}
          sx={{
            '& .MuiCardHeader-action': {
              alignSelf: 'center',
              m: 0,
            },
          }}
        />
      )}
      <Collapse in={!collapsible || !collapsed}>
        <CardContent sx={{ pt: hasHeader ? 0 : undefined }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
}
