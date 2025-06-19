import React, { useState } from 'react';
import { Paper, PaperProps, Box, Typography, Collapse, Button, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

export interface CardProps extends Omit<PaperProps, 'variant'> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  responsive?: boolean;
}

export interface CollapsibleCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expandButtonText?: {
    expanded: string;
    collapsed: string;
  };
  onToggle?: (expanded: boolean) => void;
  responsive?: boolean;
}

const StyledCard = styled(Paper)<{ customvariant?: string; custompadding?: string; ismobile?: boolean }>(
  ({ theme, customvariant, custompadding, ismobile }) => ({
    borderRadius: ismobile ? 6 : 8,
    overflow: 'hidden',
    
    ...(customvariant === 'default' && {
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      boxShadow: 'none',
    }),
    
    ...(customvariant === 'outlined' && {
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      boxShadow: 'none',
    }),
    
    ...(customvariant === 'elevated' && {
      backgroundColor: 'white',
      border: 'none',
      boxShadow: ismobile 
        ? '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
  })
);

const CardContent = styled(Box)<{ custompadding?: string; ismobile?: boolean }>(({ custompadding, ismobile }) => ({
  ...(custompadding === 'none' && {
    padding: 0,
  }),
  ...(custompadding === 'small' && {
    padding: ismobile ? 8 : 12,
  }),
  ...(custompadding === 'medium' && {
    padding: ismobile ? 16 : 24,
  }),
  ...(custompadding === 'large' && {
    padding: ismobile ? 20 : 32,
  }),
}));

const CardHeader = styled(Box)<{ ismobile?: boolean }>(({ theme, ismobile }) => ({
  padding: ismobile ? '12px 16px' : '16px 20px',
  borderBottom: '1px solid #f0f0f0',
  backgroundColor: 'rgba(0, 74, 173, 0.02)',
}));

const CardFooter = styled(Box)<{ ismobile?: boolean }>(({ theme, ismobile }) => ({
  padding: ismobile ? '8px 16px' : '12px 20px',
  borderTop: '1px solid #f0f0f0',
  backgroundColor: '#fafafa',
}));

const ContinuousDeploymentHeader = styled(Box)<{ ismobile?: boolean }>(({ theme, ismobile }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: ismobile ? 12 : 16,
  backgroundColor: 'rgba(0, 74, 173, 0.05)',
  borderBottom: '1px solid #e0e0e0',
  borderRadius: ismobile ? '6px 6px 0 0' : '8px 8px 0 0',
  flexDirection: ismobile ? 'column' : 'row',
  gap: ismobile ? 1 : 0,
}));

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  header,
  footer,
  title,
  subtitle,
  icon,
  badge,
  responsive = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const renderHeader = () => {
    if (title || subtitle || icon || badge) {
      return (
        <ContinuousDeploymentHeader ismobile={shouldBeMobile}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: shouldBeMobile ? '100%' : 'auto' }}>
            {icon && (
              <Box sx={{ mr: shouldBeMobile ? 1.5 : 2 }}>
                {icon}
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {title && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: shouldBeMobile ? '1rem' : '1.125rem',
                    fontWeight: 500,
                    color: '#333',
                    mb: subtitle ? 0.25 : 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
                    wordBreak: 'break-word'
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {badge && (
            <Box sx={{ 
              mt: shouldBeMobile ? 1 : 0,
              alignSelf: shouldBeMobile ? 'flex-start' : 'center'
            }}>
              {badge}
            </Box>
          )}
        </ContinuousDeploymentHeader>
      );
    }
    return header;
  };

  const renderFooter = () => {
    if (footer) {
      return (
        <CardFooter ismobile={shouldBeMobile}>
          {footer}
        </CardFooter>
      );
    }
    return null;
  };

  return (
    <StyledCard
      customvariant={variant}
      custompadding={padding}
      ismobile={shouldBeMobile}
      {...props}
    >
      {renderHeader()}
      <CardContent custompadding={padding} ismobile={shouldBeMobile}>
        {children}
      </CardContent>
      {renderFooter()}
    </StyledCard>
  );
};

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  defaultExpanded = true,
  expandButtonText = { expanded: 'Hide', collapsed: 'Show' },
  onToggle,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <Card variant="outlined" padding="none" responsive={responsive}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: shouldBeMobile ? 2 : 3,
          borderBottom: expanded ? '1px solid #f0f0f0' : 'none',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 74, 173, 0.02)'
          },
          flexDirection: shouldBeMobile ? 'column' : 'row',
          gap: shouldBeMobile ? 1.5 : 0
        }}
        onClick={handleToggle}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: shouldBeMobile ? '100%' : 'auto'
        }}>
          {icon && (
            <Box sx={{ mr: shouldBeMobile ? 1.5 : 2 }}>
              {icon}
            </Box>
          )}
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: shouldBeMobile ? '1rem' : '1.125rem',
                fontWeight: 500,
                color: '#333',
                mb: subtitle ? 0.25 : 0
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="text"
          size="small"
          endIcon={expanded ? <ExpandLess /> : <ExpandMoreIcon />}
          sx={{
            color: '#004aad',
            fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
            fontWeight: 500,
            minWidth: shouldBeMobile ? '100%' : 'auto',
            justifyContent: shouldBeMobile ? 'center' : 'flex-start'
          }}
        >
          {expanded ? expandButtonText.expanded : expandButtonText.collapsed}
        </Button>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: shouldBeMobile ? 2 : 3 }}>
          {children}
        </Box>
      </Collapse>
    </Card>
  );
}; 