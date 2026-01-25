'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import MuiStepper from '@mui/material/Stepper';
import MuiStep from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';
export type StepsDirection = 'horizontal' | 'vertical';
export type StepsSize = 'sm' | 'md' | 'lg';

export interface StepItem {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: StepStatus;
}

export interface StepsProps {
  items: StepItem[];
  current?: number;
  direction?: StepsDirection;
  size?: StepsSize;
  onChange?: (step: number) => void;
  clickable?: boolean;
  className?: string;
}

const sizeMap: Record<StepsSize, { iconSize: number; fontSize: string }> = {
  sm: { iconSize: 24, fontSize: '0.75rem' },
  md: { iconSize: 32, fontSize: '0.875rem' },
  lg: { iconSize: 40, fontSize: '1rem' },
};

const ColorlibConnector = styled(StepConnector)<{
  ownerState: { size: StepsSize };
}>(({ theme, ownerState }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: (sizeMap[ownerState.size].iconSize - 2) / 2,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.success.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 1,
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[700],
    }),
  },
}));

interface StepIconRootProps {
  ownerState: {
    completed?: boolean;
    active?: boolean;
    error?: boolean;
    size: StepsSize;
  };
}

const StepIconRoot = styled('div')<StepIconRootProps>(
  ({ theme, ownerState }) => ({
    backgroundColor: theme.palette.grey[300],
    zIndex: 1,
    color: theme.palette.grey[600],
    width: sizeMap[ownerState.size].iconSize,
    height: sizeMap[ownerState.size].iconSize,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: sizeMap[ownerState.size].fontSize,
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[700],
      color: theme.palette.grey[400],
    }),
    ...(ownerState.active && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    }),
    ...(ownerState.completed && {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.common.white,
    }),
    ...(ownerState.error && {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white,
    }),
  }),
);

interface CustomStepIconProps {
  active: boolean;
  completed: boolean;
  error: boolean;
  icon: ReactNode;
  index: number;
  size: StepsSize;
  customIcon?: ReactNode;
}

function CustomStepIcon(props: CustomStepIconProps) {
  const { active, completed, error, index, size, customIcon } = props;

  return (
    <StepIconRoot ownerState={{ completed, active, error, size }}>
      {customIcon ? (
        customIcon
      ) : completed ? (
        <CheckIcon sx={{ fontSize: sizeMap[size].iconSize * 0.5 }} />
      ) : error ? (
        <CloseIcon sx={{ fontSize: sizeMap[size].iconSize * 0.5 }} />
      ) : (
        index + 1
      )}
    </StepIconRoot>
  );
}

export const Steps = forwardRef<HTMLDivElement, StepsProps>(
  (
    {
      items,
      current = 0,
      direction = 'horizontal',
      size = 'md',
      onChange,
      clickable = false,
      className,
    },
    ref,
  ) => {
    const getStepStatus = (index: number, item: StepItem): StepStatus => {
      if (item.status) return item.status;
      if (index < current) return 'completed';
      if (index === current) return 'current';
      return 'pending';
    };

    const handleClick = (index: number) => {
      if (clickable && onChange) {
        onChange(index);
      }
    };

    return (
      <Box ref={ref} className={className}>
        <MuiStepper
          activeStep={current}
          orientation={direction}
          alternativeLabel={direction === 'horizontal'}
          connector={<ColorlibConnector ownerState={{ size }} />}
        >
          {items.map((item, index) => {
            const status = getStepStatus(index, item);
            const isError = status === 'error';
            const isCompleted = status === 'completed';
            const isActive = status === 'current';

            return (
              <MuiStep
                key={index}
                completed={isCompleted}
                sx={{
                  cursor: clickable ? 'pointer' : 'default',
                }}
                onClick={() => handleClick(index)}
              >
                <StepLabel
                  error={isError}
                  StepIconComponent={(props) => (
                    <CustomStepIcon
                      {...props}
                      active={isActive}
                      completed={isCompleted}
                      error={isError}
                      index={index}
                      size={size}
                      customIcon={item.icon}
                    />
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: sizeMap[size].fontSize,
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: sizeMap[size].fontSize,
                      fontWeight: isActive ? 600 : 400,
                      color: isError
                        ? 'error.main'
                        : isActive
                          ? 'primary.main'
                          : 'text.primary',
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: `calc(${sizeMap[size].fontSize} - 0.125rem)`,
                      }}
                    >
                      {item.description}
                    </Typography>
                  )}
                </StepLabel>
              </MuiStep>
            );
          })}
        </MuiStepper>
      </Box>
    );
  },
);

Steps.displayName = 'Steps';
