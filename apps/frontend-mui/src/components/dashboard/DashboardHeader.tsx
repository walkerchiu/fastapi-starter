'use client';

import { useState, type ReactNode, type FormEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

export interface DashboardHeaderProps {
  logo?: ReactNode;
  title?: string;
  showMenuToggle?: boolean;
  onMenuToggle?: () => void;
  actions?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  sticky?: boolean;
  className?: string;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  ...theme.applyStyles('dark', {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.15),
    },
  }),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

export function DashboardHeader({
  logo,
  title,
  showMenuToggle = true,
  onMenuToggle,
  actions,
  searchPlaceholder = 'Search...',
  onSearch,
  showSearch = false,
  sticky = true,
  className,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <AppBar
      position={sticky ? 'sticky' : 'static'}
      color="inherit"
      elevation={0}
      className={className}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        zIndex: 20,
      }}
    >
      <Toolbar>
        {/* Left section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showMenuToggle && onMenuToggle && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Toggle menu"
              onClick={onMenuToggle}
            >
              <MenuIcon />
            </IconButton>
          )}

          {logo && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>{logo}</Box>
          )}

          {title && (
            <Typography variant="h6" component="h1" noWrap>
              {title}
            </Typography>
          )}
        </Box>

        {/* Center section - Search */}
        {showSearch && (
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              mx: 4,
            }}
          >
            <Search sx={{ maxWidth: 400, width: '100%' }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          </Box>
        )}

        {/* Spacer */}
        {!showSearch && <Box sx={{ flexGrow: 1 }} />}

        {/* Right section - Actions */}
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
