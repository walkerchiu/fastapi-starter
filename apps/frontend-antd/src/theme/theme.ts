import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import { lightTokens, darkTokens } from './tokens';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: lightTokens.colorPrimary,
    colorBgContainer: lightTokens.colorBgContainer,
    colorBgLayout: lightTokens.colorBgLayout,
    colorBgElevated: lightTokens.colorBgElevated,
    colorText: lightTokens.colorText,
    colorTextSecondary: lightTokens.colorTextSecondary,
    colorTextDisabled: lightTokens.colorTextDisabled,
    colorBorder: lightTokens.colorBorder,
    colorBorderSecondary: lightTokens.colorBorderSecondary,
    colorSuccess: lightTokens.colorSuccess,
    colorWarning: lightTokens.colorWarning,
    colorError: lightTokens.colorError,
    colorInfo: lightTokens.colorInfo,
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: lightTokens.colorPrimary,
      algorithm: true,
    },
    Card: {
      colorBgContainer: lightTokens.colorBgContainer,
    },
    Input: {
      colorBgContainer: lightTokens.colorBgContainer,
    },
    Select: {
      colorBgContainer: lightTokens.colorBgContainer,
    },
    Modal: {
      colorBgElevated: lightTokens.colorBgContainer,
    },
    Table: {
      colorBgContainer: lightTokens.colorBgContainer,
    },
  },
};

export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: darkTokens.colorPrimary,
    colorBgContainer: darkTokens.colorBgContainer,
    colorBgLayout: darkTokens.colorBgLayout,
    colorBgElevated: darkTokens.colorBgElevated,
    colorText: darkTokens.colorText,
    colorTextSecondary: darkTokens.colorTextSecondary,
    colorTextDisabled: darkTokens.colorTextDisabled,
    colorBorder: darkTokens.colorBorder,
    colorBorderSecondary: darkTokens.colorBorderSecondary,
    colorSuccess: darkTokens.colorSuccess,
    colorWarning: darkTokens.colorWarning,
    colorError: darkTokens.colorError,
    colorInfo: darkTokens.colorInfo,
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: darkTokens.colorPrimary,
      algorithm: true,
    },
    Card: {
      colorBgContainer: darkTokens.colorBgContainer,
    },
    Input: {
      colorBgContainer: darkTokens.colorBgContainer,
    },
    Select: {
      colorBgContainer: darkTokens.colorBgContainer,
    },
    Modal: {
      colorBgElevated: darkTokens.colorBgContainer,
    },
    Table: {
      colorBgContainer: darkTokens.colorBgContainer,
    },
  },
};
