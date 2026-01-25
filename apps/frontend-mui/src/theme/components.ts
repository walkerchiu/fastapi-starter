import type { Components, Theme } from '@mui/material/styles';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6, // rounded-md
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
      sizeSmall: {
        padding: '6px 10px', // px-2.5 py-1.5
        fontSize: '0.75rem', // text-xs
      },
      sizeMedium: {
        padding: '8px 12px', // px-3 py-2
        fontSize: '0.875rem', // text-sm
      },
      sizeLarge: {
        padding: '10px 16px', // px-4 py-2.5
        fontSize: '1rem', // text-base
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 6, // rounded-md
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 6,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8, // rounded-lg
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' // shadow-sm
            : 'none',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        ...(theme.palette.mode === 'dark' && {
          backgroundColor: theme.palette.background.paper,
        }),
      }),
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8, // rounded-lg
      },
      standardSuccess: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? '#dcfce7' // green-100
            : 'rgba(22, 163, 74, 0.2)',
        color:
          theme.palette.mode === 'light'
            ? '#166534' // green-800
            : '#4ade80', // green-400
      }),
      standardError: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? '#fee2e2' // red-100
            : 'rgba(220, 38, 38, 0.2)',
        color:
          theme.palette.mode === 'light'
            ? '#991b1b' // red-800
            : '#f87171', // red-400
      }),
      standardWarning: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? '#fef3c7' // amber-100
            : 'rgba(217, 119, 6, 0.2)',
        color:
          theme.palette.mode === 'light'
            ? '#92400e' // amber-800
            : '#fbbf24', // amber-400
      }),
      standardInfo: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'light'
            ? '#dbeafe' // blue-100
            : 'rgba(37, 99, 235, 0.2)',
        color:
          theme.palette.mode === 'light'
            ? '#1e40af' // blue-800
            : '#60a5fa', // blue-400
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 8, // rounded-lg
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 9999, // rounded-full
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        fontSize: '0.75rem',
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
  },
};
