import React from 'react';
import { Chip, ChipProps, Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  responsive?: boolean;
}

export interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: string;
  variant?: 'filled' | 'outlined';
  responsive?: boolean;
}

export interface TeamBadgeProps {
  team: string;
  responsive?: boolean;
}

export interface CustomStatusBadgeProps {
  status: string;
  responsive?: boolean;
}

export interface StatusIconProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  responsive?: boolean;
}

const StyledBadge = styled(Chip)<{ customvariant?: string; customsize?: string; ismobile?: boolean }>(
  ({ theme, customvariant, customsize, ismobile }) => ({
    borderRadius: ismobile ? 4 : 6,
    fontWeight: 500,
    border: 'none',
    
    // Size variants
    ...(customsize === 'small' && {
      height: ismobile ? 18 : 20,
      fontSize: ismobile ? '0.65rem' : '0.7rem',
      '& .MuiChip-label': {
        paddingLeft: ismobile ? 4 : 6,
        paddingRight: ismobile ? 4 : 6,
      },
    }),
    
    ...(customsize === 'medium' && {
      height: ismobile ? 22 : 24,
      fontSize: ismobile ? '0.7rem' : '0.75rem',
      '& .MuiChip-label': {
        paddingLeft: ismobile ? 6 : 8,
        paddingRight: ismobile ? 6 : 8,
      },
    }),
    
    // Color variants
    ...(customvariant === 'success' && {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      color: '#4caf50',
    }),
    
    ...(customvariant === 'warning' && {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      color: '#ff9800',
    }),
    
    ...(customvariant === 'error' && {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      color: '#f44336',
    }),
    
    ...(customvariant === 'primary' && {
      backgroundColor: 'rgba(0, 74, 173, 0.1)',
      color: '#004aad',
    }),
  })
);

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'rgba(0, 74, 173, 0.1)',
          color: '#004aad',
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(108, 117, 125, 0.1)',
          color: '#6c757d',
        };
      case 'success':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#4caf50',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          color: '#ff9800',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#f44336',
        };
      default:
        return {
          backgroundColor: 'rgba(0, 74, 173, 0.1)',
          color: '#004aad',
        };
    }
  };

  return (
    <Chip
      label={children}
      size={shouldBeMobile ? 'small' : size}
      sx={{
        ...getVariantStyles(),
        fontWeight: 500,
        fontSize: shouldBeMobile 
          ? (size === 'small' ? '0.65rem' : '0.7rem')
          : (size === 'small' ? '0.75rem' : '0.875rem'),
        height: shouldBeMobile 
          ? (size === 'small' ? 18 : 22)
          : (size === 'small' ? 20 : 24),
        borderRadius: shouldBeMobile ? 1 : 1.5,
      }}
    />
  );
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'filled',
  responsive = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'operational':
      case 'success':
      case 'good':
        return '#2e7d32';
      case 'warning':
      case 'degraded':
        return '#ed6c02';
      case 'error':
      case 'critical':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'operational':
      case 'success':
      case 'good':
        return '#e8f5e9';
      case 'warning':
      case 'degraded':
        return '#fff3e0';
      case 'error':
      case 'critical':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  return (
    <Chip 
      label={status} 
      size="small"
      sx={{ 
        bgcolor: getStatusBgColor(status),
        color: getStatusColor(status),
        fontWeight: 500,
        fontSize: shouldBeMobile ? '0.65rem' : '0.75rem',
        height: shouldBeMobile ? 18 : 20,
        borderRadius: shouldBeMobile ? 1 : 1.5,
        '& .MuiChip-label': {
          px: shouldBeMobile ? 0.75 : 1
        },
        ...props.sx
      }}
      {...props}
    />
  );
};

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 'small',
  showText = true,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const getStatusIcon = (status: string) => {
    const iconSize = shouldBeMobile 
      ? 'small' 
      : (size === 'small' ? 'small' : size === 'medium' ? 'medium' : 'large');
    
    switch(status.toLowerCase()) {
      case 'published':
      case 'success':
      case 'operational':
        return <CheckCircleIcon fontSize={iconSize} sx={{ color: '#2ebc4f' }} />;
      case 'error':
      case 'failed':
        return <ErrorIcon fontSize={iconSize} sx={{ color: '#e53935' }} />;
      case 'pending':
      case 'building':
        return <ScheduleIcon fontSize={iconSize} sx={{ color: '#ff9800' }} />;
      case 'warning':
        return <WarningIcon fontSize={iconSize} sx={{ color: '#ff9800' }} />;
      default:
        return <ScheduleIcon fontSize={iconSize} sx={{ color: '#757575' }} />;
    }
  };

  const getStatusText = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!showText) {
    return getStatusIcon(status);
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: shouldBeMobile ? 0.5 : 0.75
    }}>
      {getStatusIcon(status)}
      <span style={{ 
        fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
        fontWeight: 500 
      }}>
        {getStatusText(status)}
      </span>
    </Box>
  );
};

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  team,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  let color = '';
  
  switch(team) {
    case 'Core Team':
      color = '#004aad';
      break;
    case 'Product Team':
      color = '#ff9800';
      break;
    case 'Design Team':
      color = '#9c27b0';
      break;
    case 'External':
      color = '#9e9e9e';
      break;
    default:
      color = '#757575';
  }

  return (
    <Box sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1.5,
      py: 0.5,
      backgroundColor: `${color}10`,
      borderRadius: 1,
      color: color,
      fontWeight: 500,
      fontSize: '0.875rem'
    }}>
      {team === 'External' ? 'External Collaborator' : team}
    </Box>
  );
};

export const CustomStatusBadge: React.FC<CustomStatusBadgeProps> = ({
  status,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  let color = '';
  let bgcolor = '';
  
  switch(status) {
    case 'Pending':
      color = '#ff9800';
      bgcolor = 'rgba(255, 152, 0, 0.1)';
      break;
    case 'Request':
      color = '#9c27b0';
      bgcolor = 'rgba(156, 39, 176, 0.1)';
      break;
    case 'Active':
      color = '#4caf50';
      bgcolor = 'rgba(76, 175, 80, 0.1)';
      break;
    default:
      color = '#757575';
      bgcolor = 'rgba(117, 117, 117, 0.1)';
  }

  return (
    <Box sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1.5,
      py: 0.5,
      backgroundColor: bgcolor,
      borderRadius: 1,
      color: color
    }}>
      {status}
    </Box>
  );
}; 