'use client';

import { createTheme } from '@mui/material/styles';

import { components } from './components';
import { darkPalette, lightPalette } from './palette';
import { typography } from './typography';

export const lightTheme = createTheme({
  palette: lightPalette,
  typography,
  components,
  shape: {
    borderRadius: 6,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});

export const darkTheme = createTheme({
  palette: darkPalette,
  typography,
  components,
  shape: {
    borderRadius: 6,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});
