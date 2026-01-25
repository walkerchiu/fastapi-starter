import type { PaletteOptions } from '@mui/material/styles';

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#4f46e5', // indigo-600
    light: '#6366f1', // indigo-500
    dark: '#4338ca', // indigo-700
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f3f4f6', // gray-100
    light: '#f9fafb', // gray-50
    dark: '#e5e7eb', // gray-200
    contrastText: '#111827', // gray-900
  },
  error: {
    main: '#dc2626', // red-600
    light: '#fecaca', // red-200
    dark: '#b91c1c', // red-700
    contrastText: '#ffffff',
  },
  warning: {
    main: '#d97706', // amber-600
    light: '#fef3c7', // amber-100
    dark: '#b45309', // amber-700
    contrastText: '#ffffff',
  },
  success: {
    main: '#16a34a', // green-600
    light: '#dcfce7', // green-100
    dark: '#15803d', // green-700
    contrastText: '#ffffff',
  },
  info: {
    main: '#2563eb', // blue-600
    light: '#dbeafe', // blue-100
    dark: '#1d4ed8', // blue-700
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#f9fafb', // gray-50
  },
  text: {
    primary: '#111827', // gray-900
    secondary: '#4b5563', // gray-600
    disabled: '#9ca3af', // gray-400
  },
  divider: '#e5e7eb', // gray-200
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#6366f1', // indigo-500
    light: '#818cf8', // indigo-400
    dark: '#4f46e5', // indigo-600
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#374151', // gray-700
    light: '#4b5563', // gray-600
    dark: '#1f2937', // gray-800
    contrastText: '#f9fafb', // gray-50
  },
  error: {
    main: '#ef4444', // red-500
    light: 'rgba(220, 38, 38, 0.2)',
    dark: '#dc2626', // red-600
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b', // amber-500
    light: 'rgba(217, 119, 6, 0.2)',
    dark: '#d97706', // amber-600
    contrastText: '#000000',
  },
  success: {
    main: '#22c55e', // green-500
    light: 'rgba(22, 163, 74, 0.2)',
    dark: '#16a34a', // green-600
    contrastText: '#ffffff',
  },
  info: {
    main: '#3b82f6', // blue-500
    light: 'rgba(37, 99, 235, 0.2)',
    dark: '#2563eb', // blue-600
    contrastText: '#ffffff',
  },
  background: {
    default: '#111827', // gray-900
    paper: '#1f2937', // gray-800
  },
  text: {
    primary: '#f9fafb', // gray-50
    secondary: '#9ca3af', // gray-400
    disabled: '#6b7280', // gray-500
  },
  divider: '#374151', // gray-700
};
