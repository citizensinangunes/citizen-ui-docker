import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress, Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  responsive?: boolean;
}

export interface PrimaryButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text';
  responsive?: boolean;
}

export interface ActionButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  cancelText?: string;
  saveText?: string;
  saveDisabled?: boolean;
  responsive?: boolean;
}

export interface BigButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  label?: string;
  responsive?: boolean;
}

export interface ActionButtonGroupProps {
  buttons: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    disabled?: boolean;
  }>;
  responsive?: boolean;
}

export interface ActionButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'approve' | 'reject' | 'remove';
  responsive?: boolean;
}

const StyledButton = styled(MuiButton)<{ customvariant?: string; ismobile?: string }>(({ theme, customvariant, ismobile }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 500,
  padding: ismobile === 'true' ? theme.spacing(1, 2) : theme.spacing(1.25, 2.5),
  minHeight: ismobile === 'true' ? 36 : 40,
  fontSize: ismobile === 'true' ? '0.875rem' : '1rem',
  
  ...(customvariant === 'primary' && {
    backgroundColor: '#004aad',
    color: 'white',
    '&:hover': {
      backgroundColor: '#003a87',
    },
  }),
  
  ...(customvariant === 'secondary' && {
    backgroundColor: '#f5f5f5',
    color: '#333',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  }),
  
  ...(customvariant === 'danger' && {
    backgroundColor: '#f44336',
    color: 'white',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  }),
  
  ...(customvariant === 'ghost' && {
    backgroundColor: 'transparent',
    color: '#004aad',
    '&:hover': {
      backgroundColor: 'rgba(0, 74, 173, 0.05)',
    },
  }),
  
  ...(customvariant === 'outline' && {
    backgroundColor: 'transparent',
    color: '#004aad',
    border: '1px solid #004aad',
    '&:hover': {
      backgroundColor: 'rgba(0, 74, 173, 0.05)',
    },
  }),
}));

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  responsive = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDisabled = Boolean(disabled || loading);

  return (
    <StyledButton
      {...props}
      customvariant={variant}
      ismobile={responsive && isMobile ? 'true' : 'false'}
      disabled={isDisabled}
      startIcon={!loading && icon && iconPosition === 'left' ? icon : undefined}
      endIcon={!loading && icon && iconPosition === 'right' ? icon : undefined}
    >
      {loading && (
        <CircularProgress 
          size={responsive && isMobile ? 14 : 16} 
          sx={{ 
            mr: 1,
            color: variant === 'primary' || variant === 'danger' ? 'white' : '#004aad'
          }} 
        />
      )}
      {children}
    </StyledButton>
  );
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'contained',
  loading = false,
  disabled,
  responsive = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDisabled = Boolean(disabled || loading);

  return (
    <MuiButton
      {...props}
      variant={variant}
      disabled={isDisabled}
      sx={{
        bgcolor: variant === 'contained' ? '#004aad' : 'transparent',
        color: variant === 'contained' ? 'white' : '#004aad',
        borderColor: '#004aad',
        '&:hover': {
          bgcolor: variant === 'contained' ? '#003a87' : 'rgba(0, 74, 173, 0.04)',
          borderColor: '#003a87',
        },
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: 1.5,
        fontSize: responsive && isMobile ? '0.875rem' : '1rem',
        minHeight: responsive && isMobile ? 36 : 40,
        px: responsive && isMobile ? 2 : 2.5,
        py: responsive && isMobile ? 1 : 1.25,
        ...props.sx
      }}
      startIcon={loading ? <CircularProgress size={responsive && isMobile ? 14 : 16} /> : props.startIcon}
    >
      {children}
    </MuiButton>
  );
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onSave,
  cancelText = 'Cancel',
  saveText = 'Save',
  saveDisabled = false,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // On mobile, stack buttons vertically and make them full width
  const mobileDirection = responsive && isMobile ? 'column-reverse' : 'row';
  const mobileJustify = responsive && isMobile ? 'stretch' : 'flex-end';
  const mobileGap = responsive && isMobile ? 1.5 : 2;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: mobileGap,
        flexDirection: mobileDirection,
        justifyContent: mobileJustify,
        width: responsive && isMobile ? '100%' : 'auto'
      }}
    >
      <MuiButton
        variant="outlined"
        onClick={onCancel}
        fullWidth={responsive && isMobile}
        sx={{
          color: '#666',
          borderColor: '#ddd',
          '&:hover': {
            borderColor: '#bbb',
            bgcolor: 'rgba(0, 0, 0, 0.04)'
          },
          textTransform: 'none',
          borderRadius: 0.5,
          fontSize: responsive && isMobile ? '0.875rem' : '1rem',
          minHeight: responsive && isMobile ? 36 : 40,
        }}
      >
        {cancelText}
      </MuiButton>
      <MuiButton
        variant="contained"
        onClick={onSave}
        disabled={saveDisabled}
        fullWidth={responsive && isMobile}
        sx={{
          bgcolor: '#004aad',
          '&:hover': {
            bgcolor: '#003a87'
          },
          textTransform: 'none',
          borderRadius: 0.5,
          fontSize: responsive && isMobile ? '0.875rem' : '1rem',
          minHeight: responsive && isMobile ? 36 : 40,
        }}
      >
        {saveText}
      </MuiButton>
    </Box>
  );
};

export const BigButton: React.FC<BigButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  responsive = false
}) => {
  return (
    <MuiButton 
      fullWidth
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      sx={{ 
        p: 2, 
        borderColor: '#e8e8e8',
        borderWidth: '1px',
        color: '#333',
        textTransform: 'none',
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: '#fafafa',
        minHeight: 90,
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { 
          bgcolor: '#f0f7ff', 
          borderColor: '#004aad'
        },
        ...(responsive && {
          fontSize: '0.875rem',
          minHeight: 70
        })
      }}
    >
      <Box sx={{ 
        fontSize: '2rem', 
        mb: 1, 
        color: '#004aad'
      }}>
        {icon}
      </Box>
      <Typography 
        variant="body2" 
        fontWeight={600}
        sx={{ 
          color: '#555',
          fontSize: '0.8rem',
          lineHeight: 1.2
        }}
      >
        {label}
      </Typography>
    </MuiButton>
  );
};

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  responsive = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // On mobile, stack buttons vertically and make them full width
  const mobileDirection = responsive && isMobile ? 'column-reverse' : 'row';
  const mobileJustify = responsive && isMobile ? 'stretch' : 'flex-end';
  const mobileGap = responsive && isMobile ? 1.5 : 2;

  const getMuiVariant = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
      case 'outline':
      case 'danger':
        return 'outlined';
      default:
        return 'contained';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: mobileJustify, 
      gap: mobileGap,
      flexDirection: mobileDirection
    }}>
      {buttons.map((button, index) => (
        <MuiButton
          key={index}
          variant={getMuiVariant(button.variant)}
          size="small"
          onClick={button.onClick}
          disabled={button.disabled}
          sx={{
            ...(button.variant === 'primary' && {
              bgcolor: '#004aad',
              color: 'white',
              '&:hover': { bgcolor: '#003a87' }
            }),
            ...(button.variant === 'secondary' && {
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                bgcolor: 'rgba(244,67,54,0.04)'
              }
            }),
            ...(button.variant === 'outline' && {
              borderColor: '#004aad',
              color: '#004aad',
              '&:hover': {
                bgcolor: 'rgba(0, 74, 173, 0.05)'
              }
            }),
            ...(button.variant === 'danger' && {
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                bgcolor: 'rgba(244,67,54,0.04)'
              }
            }),
            textTransform: 'none',
            borderRadius: 0.5,
            fontSize: responsive && isMobile ? '0.875rem' : '1rem',
            minHeight: responsive && isMobile ? 36 : 40,
          }}
        >
          {button.label}
        </MuiButton>
      ))}
    </Box>
  );
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'approve',
  children,
  responsive = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getButtonStyles = () => {
    switch (variant) {
      case 'approve':
        return {
          bgcolor: '#004aad',
          color: 'white',
          '&:hover': { bgcolor: '#003a87' }
        };
      case 'reject':
        return {
          borderColor: '#f44336',
          color: '#f44336',
          '&:hover': {
            borderColor: '#d32f2f',
            bgcolor: 'rgba(244,67,54,0.04)'
          }
        };
      case 'remove':
        return {
          borderColor: '#f44336',
          color: '#f44336',
          '&:hover': {
            borderColor: '#d32f2f',
            bgcolor: 'rgba(244,67,54,0.04)'
          }
        };
      default:
        return {
          bgcolor: '#004aad',
          color: 'white',
          '&:hover': { bgcolor: '#003a87' }
        };
    }
  };

  const muiVariant = variant === 'approve' ? 'contained' : 'outlined';

  return (
    <MuiButton
      variant={muiVariant}
      size="small"
      sx={getButtonStyles()}
      {...props}
    >
      {children}
    </MuiButton>
  );
}; 