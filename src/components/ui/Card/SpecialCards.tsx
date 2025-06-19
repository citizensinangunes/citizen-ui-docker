import React from 'react';
import { Paper, Box, Typography, Button, useTheme, useMediaQuery, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';

export interface DangerCardProps {
  title: string;
  subtitle?: string;
  description: string;
  buttonText: string;
  buttonColor?: 'error' | 'success' | 'warning' | 'primary';
  onButtonClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  responsive?: boolean;
}

export interface LogsCardProps {
  title: string;
  subtitle: string;
  logSource: string;
  onLogSourceChange: (value: string) => void;
  logSourceOptions: Array<{ value: string; label: string }>;
  onDownload?: () => void;
  children: React.ReactNode;
  responsive?: boolean;
}

export interface SiteHeaderCardProps {
  siteName: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'pending' | string;
  framework?: string;
  repoName?: string;
  lastDeployedAt?: string;
  onShareClick?: () => void;
  responsive?: boolean;
}

export const DangerCard: React.FC<DangerCardProps> = ({
  title,
  subtitle,
  description,
  buttonText,
  buttonColor = 'error',
  onButtonClick,
  icon,
  disabled = false,
  children,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const getButtonStyles = () => {
    const baseStyles = {
      fontSize: shouldBeMobile ? '0.875rem' : '1rem',
      minHeight: shouldBeMobile ? 36 : 40,
      px: shouldBeMobile ? 2 : 2.5,
      py: shouldBeMobile ? 1 : 1.25,
    };

    switch (buttonColor) {
      case 'success':
        return { ...baseStyles, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } };
      case 'warning':
        return { ...baseStyles, bgcolor: '#ed6c02', '&:hover': { bgcolor: '#e65100' } };
      case 'primary':
        return { ...baseStyles, bgcolor: '#004aad', '&:hover': { bgcolor: '#003a87' } };
      default:
        return { ...baseStyles, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } };
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: shouldBeMobile ? 1.5 : 2,
        overflow: 'hidden',
        mb: shouldBeMobile ? 2 : 3
      }}
    >
      <Box 
        sx={{ 
          p: 0,  
          border: '1px solid #e0e0e0',
          borderRadius: shouldBeMobile ? 1.5 : 2
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: shouldBeMobile ? 1.5 : 2,
            bgcolor: 'rgba(0, 74, 173, 0.05)',
            borderBottom: '1px solid #e0e0e0',
            borderRadius: `${shouldBeMobile ? 1.5 : 2}px ${shouldBeMobile ? 1.5 : 2}px 0 0`
          }}
        >
          <Box>
            <Typography 
              variant={shouldBeMobile ? "body1" : "subtitle1"} 
              fontWeight={500}
              sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Content */}
        <Box sx={{ p: shouldBeMobile ? 2 : 3 }}>
          {children || (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              paragraph
              sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
            >
              {description}
            </Typography>
          )}
          
          <Button 
            variant="contained"
            onClick={onButtonClick}
            disabled={disabled}
            fullWidth={shouldBeMobile}
            sx={getButtonStyles()}
            startIcon={icon}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export const LogsCard: React.FC<LogsCardProps> = ({
  title,
  subtitle,
  logSource,
  onLogSourceChange,
  logSourceOptions,
  onDownload,
  children,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const handleLogSourceChange = (event: SelectChangeEvent) => {
    onLogSourceChange(event.target.value);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      <Box 
        sx={{ 
          p: 0,  
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        {/* Logs Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: shouldBeMobile ? 1.5 : 2,
            bgcolor: 'rgba(0, 74, 173, 0.05)',
            borderBottom: '1px solid #e0e0e0',
            borderRadius: '2px 2px 0 0',
            flexDirection: shouldBeMobile ? 'column' : 'row',
            gap: shouldBeMobile ? 2 : 0
          }}
        >
          <Box sx={{ width: shouldBeMobile ? '100%' : 'auto' }}>
            <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: shouldBeMobile ? '1rem' : '1.125rem' }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: shouldBeMobile ? 1 : 2,
            width: shouldBeMobile ? '100%' : 'auto',
            flexDirection: shouldBeMobile ? 'column' : 'row'
          }}>
            <FormControl variant="standard" size="small" sx={{ minWidth: 140, width: shouldBeMobile ? '100%' : 'auto' }}>
              <Select
                value={logSource}
                onChange={handleLogSourceChange}
                displayEmpty
                sx={{ fontSize: '0.875rem' }}
              >
                {logSourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {onDownload && (
              <button
                onClick={onDownload}
                style={{
                  padding: shouldBeMobile ? '8px 16px' : '8px 16px',
                  backgroundColor: '#004aad',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: shouldBeMobile ? '100%' : 'auto',
                  justifyContent: shouldBeMobile ? 'center' : 'flex-start'
                }}
              >
                <DownloadIcon sx={{ fontSize: '1rem' }} />
                Download Logs
              </button>
            )}
          </Box>
        </Box>
        
        {/* Logs Content */}
        <Box sx={{ p: shouldBeMobile ? 2 : 3 }}>
          {children}
        </Box>
      </Box>
    </Paper>
  );
};

export const SiteHeaderCard: React.FC<SiteHeaderCardProps> = ({
  siteName,
  subdomain,
  status,
  framework,
  repoName,
  lastDeployedAt,
  onShareClick,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#4caf50';
      case 'inactive': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
        border: '1px solid #e0e0e0'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: shouldBeMobile ? 2 : 3,
          bgcolor: 'rgba(0, 74, 173, 0.05)',
          borderBottom: '1px solid #e0e0e0',
          flexDirection: shouldBeMobile ? 'column' : 'row',
          gap: shouldBeMobile ? 2 : 0
        }}
      >
        <Box sx={{ width: shouldBeMobile ? '100%' : 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography 
              variant="h5" 
              fontWeight={600}
              sx={{ fontSize: shouldBeMobile ? '1.25rem' : '1.5rem' }}
            >
              {siteName}
            </Typography>
            <Box 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1,
                bgcolor: getStatusColor(status),
                color: 'white',
                fontSize: shouldBeMobile ? '0.625rem' : '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase'
              }}
            >
              {status}
            </Box>
          </Box>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              fontSize: shouldBeMobile ? '0.875rem' : '1rem'
            }}
          >
            {subdomain}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: shouldBeMobile ? 1 : 2, 
            flexWrap: 'wrap',
            fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
          }}>
            {framework && (
              <Typography variant="body2" color="text.secondary">
                Framework: <strong>{framework}</strong>
              </Typography>
            )}
            {repoName && (
              <Typography variant="body2" color="text.secondary">
                Repo: <strong>{repoName}</strong>
              </Typography>
            )}
            {lastDeployedAt && (
              <Typography variant="body2" color="text.secondary">
                Last deployed: <strong>{formatDate(lastDeployedAt)}</strong>
              </Typography>
            )}
          </Box>
        </Box>
        
        {onShareClick && (
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={onShareClick}
            fullWidth={shouldBeMobile}
            sx={{
              borderColor: '#004aad',
              color: '#004aad',
              '&:hover': { borderColor: '#003a87', bgcolor: 'rgba(0,74,173,0.04)' },
              fontSize: shouldBeMobile ? '0.875rem' : '1rem'
            }}
          >
            Share
          </Button>
        )}
      </Box>
    </Paper>
  );
}; 