import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import { Memory as MemoryIcon, Timeline as TimelineIcon } from '@mui/icons-material';

export interface TabContainerProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  tabs: Array<{
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: number;
  responsive?: boolean;
}

export interface ResourceMetricsProps {
  memory: string;
  cpu: string;
  direction?: 'row' | 'column';
  responsive?: boolean;
}

export interface ConfigurationLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  responsive?: boolean;
}

export interface PageContainerProps {
  children: React.ReactNode;
  padding?: number;
  responsive?: boolean;
}

export const TabContainer: React.FC<TabContainerProps> = ({
  title,
  subtitle,
  actionButton,
  tabs,
  defaultTab = 0,
  responsive = true
}) => {
  const [tabValue, setTabValue] = useState(defaultTab);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ 
      border: '1px solid #e0e0e0', 
      borderRadius: shouldBeMobile ? 1.5 : 2, 
      overflow: 'hidden',
      mb: shouldBeMobile ? 2 : 3
    }}>
      {/* Header */}
      <Box sx={{ 
        p: shouldBeMobile ? 2 : 3, 
        bgcolor: 'rgba(0, 74, 173, 0.05)', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: shouldBeMobile ? 'flex-start' : 'center',
        flexDirection: shouldBeMobile ? 'column' : 'row',
        gap: shouldBeMobile ? 2 : 0
      }}>
        <Box sx={{ width: shouldBeMobile ? '100%' : 'auto' }}>
          <Typography 
            variant="h6" 
            fontWeight={500}
            sx={{ 
              fontSize: shouldBeMobile ? '1rem' : '1.125rem',
              mb: subtitle ? 0.5 : 0
            }}
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
        {actionButton && (
          <Box sx={{ 
            alignSelf: shouldBeMobile ? 'flex-start' : 'center',
            width: shouldBeMobile ? '100%' : 'auto'
          }}>
            {actionButton}
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={shouldBeMobile ? "scrollable" : "standard"}
          scrollButtons={shouldBeMobile ? "auto" : false}
          sx={{
            '& .MuiTab-root': {
              fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
              minHeight: shouldBeMobile ? 40 : 48,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label}
              sx={{ 
                minWidth: shouldBeMobile ? 80 : 120,
                px: shouldBeMobile ? 1 : 2
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: shouldBeMobile ? 2 : 3 }}>
        {tabs[tabValue]?.content}
      </Box>
    </Box>
  );
};

export const ResourceMetrics: React.FC<ResourceMetricsProps> = ({
  memory,
  cpu,
  direction = 'column',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: shouldBeMobile ? 'column' : direction,
      gap: shouldBeMobile ? 1.5 : 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MemoryIcon sx={{ color: '#004aad', fontSize: shouldBeMobile ? '1.25rem' : '1.5rem' }} />
        <Typography variant="body2" sx={{ fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' }}>
          Memory: <strong>{memory}</strong>
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimelineIcon sx={{ color: '#004aad', fontSize: shouldBeMobile ? '1.25rem' : '1.5rem' }} />
        <Typography variant="body2" sx={{ fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' }}>
          CPU: <strong>{cpu}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

export const ConfigurationLayout: React.FC<ConfigurationLayoutProps> = ({
  sidebar,
  children,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const shouldBeMobile = responsive && isMobile;

  if (shouldBeMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ width: '100%' }}>
          {sidebar}
        </Box>
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ width: '25%', minWidth: '250px' }}>
        {sidebar}
      </Box>
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  padding = 2,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box sx={{ 
      p: shouldBeMobile ? Math.max(padding - 0.5, 1) : padding,
      maxWidth: '100%',
      mx: 'auto'
    }}>
      {children}
    </Box>
  );
}; 