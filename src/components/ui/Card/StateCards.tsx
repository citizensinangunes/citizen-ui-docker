import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Collapse, useTheme, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

export interface LoadingStateProps {
  message?: string;
  size?: number;
  minHeight?: string;
  responsive?: boolean;
}

export interface ErrorStateProps {
  title: string;
  message?: string;
  buttonText: string;
  onButtonClick: () => void;
  buttonColor?: string;
  responsive?: boolean;
}

export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  responsive?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 60,
  minHeight = '60vh',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: shouldBeMobile ? '50vh' : minHeight,
      px: shouldBeMobile ? 2 : 0
    }}>
      <CircularProgress 
        size={shouldBeMobile ? size - 10 : size} 
        sx={{ mb: shouldBeMobile ? 3 : 4, color: '#004aad' }} 
      />
      <Typography 
        variant="h6" 
        color="text.secondary"
        sx={{ 
          fontSize: shouldBeMobile ? '1rem' : '1.25rem',
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  buttonText,
  onButtonClick,
  buttonColor = '#004aad',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: shouldBeMobile ? 4 : 6,
      px: shouldBeMobile ? 2 : 0
    }}>
      <Typography 
        variant="h5" 
        fontWeight={500} 
        gutterBottom
        sx={{ 
          fontSize: shouldBeMobile ? '1.25rem' : '1.5rem',
          mb: shouldBeMobile ? 2 : 3
        }}
      >
        {title}
      </Typography>
      {message && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ 
            fontSize: shouldBeMobile ? '0.875rem' : '1rem',
            mb: shouldBeMobile ? 3 : 4,
            maxWidth: shouldBeMobile ? '100%' : '600px',
            mx: 'auto'
          }}
        >
          {message}
        </Typography>
      )}
      <Button
        variant="contained"
        onClick={onButtonClick}
        size={shouldBeMobile ? "medium" : "large"}
        sx={{
          bgcolor: buttonColor,
          '&:hover': { 
            bgcolor: buttonColor === '#004aad' ? '#003a87' : buttonColor 
          },
          fontSize: shouldBeMobile ? '0.875rem' : '1rem',
          px: shouldBeMobile ? 3 : 4,
          py: shouldBeMobile ? 1 : 1.5
        }}
      >
        {buttonText}
      </Button>
    </Box>
  );
};

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ 
      border: '1px solid #e0e0e0', 
      borderRadius: shouldBeMobile ? 1.5 : 2, 
      overflow: 'hidden',
      mb: shouldBeMobile ? 2 : 3
    }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: shouldBeMobile ? 1.5 : 2,
          bgcolor: '#f8f9fa',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#f0f1f2'
          }
        }}
        onClick={toggleExpanded}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={500}
          sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
        >
          {title}
        </Typography>
        {expanded ? (
          <ExpandLess sx={{ color: '#666', fontSize: shouldBeMobile ? '1.25rem' : '1.5rem' }} />
        ) : (
          <ExpandMoreIcon sx={{ color: '#666', fontSize: shouldBeMobile ? '1.25rem' : '1.5rem' }} />
        )}
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: shouldBeMobile ? 2 : 3 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}; 