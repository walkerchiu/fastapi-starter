import type { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography: TypographyOptions = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '1.875rem', // text-3xl
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.5rem', // text-2xl
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.25rem', // text-xl
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.125rem', // text-lg
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1rem', // text-base
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '0.875rem', // text-sm
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem', // text-base
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem', // text-sm
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem', // text-xs
    lineHeight: 1.5,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
  },
};
