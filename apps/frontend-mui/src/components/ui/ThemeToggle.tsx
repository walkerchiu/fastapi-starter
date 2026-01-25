'use client';

import { useTheme } from '@/theme/ThemeRegistry';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeToggleProps {
  className?: string;
}

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <LightModeIcon />,
  dark: <DarkModeIcon />,
  system: <SettingsBrightnessIcon />,
};

const themeLabels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      setMode(nextTheme);
    }
  };

  return (
    <Tooltip title={`Current theme: ${themeLabels[mode]}. Click to change.`}>
      <IconButton
        onClick={cycleTheme}
        className={className}
        aria-label={`Current theme: ${themeLabels[mode]}. Click to change.`}
        size="medium"
      >
        {themeIcons[mode]}
      </IconButton>
    </Tooltip>
  );
}
