"use client";

import React, { ReactNode } from 'react';
import {
  Box,
  Tabs as MuiTabs,
  Tab as MuiTab,
  Paper,
  useTheme,
  useMediaQuery,
  SxProps,
  Theme
} from '@mui/material';

// Tab Panel Component
interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  sx?: SxProps<Theme>;
}

function TabPanel({ children, value, index, sx, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: { xs: 2, sm: 3 }, ...sx }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Tab accessibility properties
function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

// Tab Item Interface
export interface TabItem {
  label: string;
  shortLabel?: string; // For mobile
  content: ReactNode;
  disabled?: boolean;
}

// Main Tabs Component Props
export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: number;
  value?: number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  orientation?: 'horizontal' | 'vertical';
  centered?: boolean;
  indicatorColor?: 'primary' | 'secondary';
  textColor?: 'primary' | 'secondary' | 'inherit';
  allowScrollButtonsMobile?: boolean;
  scrollButtons?: 'auto' | true | false;
  sx?: SxProps<Theme>;
  tabsSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  elevation?: number;
  bordered?: boolean;
  responsive?: boolean;
}

export function Tabs({
  tabs,
  defaultValue = 0,
  value: controlledValue,
  onChange,
  variant = 'standard',
  orientation = 'horizontal',
  centered = false,
  indicatorColor = 'primary',
  textColor = 'primary',
  allowScrollButtonsMobile = true,
  scrollButtons = 'auto',
  sx,
  tabsSx,
  contentSx,
  elevation = 0,
  bordered = true,
  responsive = true,
  ...other
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (onChange) {
      onChange(event, newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  // Determine variant based on responsive settings
  const effectiveVariant = responsive && isMobile ? 'scrollable' : variant;

  return (
    <Paper 
      elevation={elevation}
      sx={{ 
        borderRadius: { xs: 1, sm: 2 }, 
        border: bordered ? '1px solid #e0e0e0' : 'none',
        overflow: 'hidden',
        ...sx
      }}
      {...other}
    >
      <MuiTabs
        value={currentValue}
        onChange={handleChange}
        variant={effectiveVariant}
        orientation={orientation}
        centered={centered && !isMobile}
        indicatorColor={indicatorColor}
        textColor={textColor}
        scrollButtons={responsive && isMobile ? scrollButtons : false}
        allowScrollButtonsMobile={allowScrollButtonsMobile}
        sx={{
          borderBottom: orientation === 'horizontal' ? 1 : 0,
          borderRight: orientation === 'vertical' ? 1 : 0,
          borderColor: 'divider',
          px: { xs: 0, sm: 2 },
          minHeight: { xs: 40, sm: 48 },
          '& .MuiTabs-indicator': {
            backgroundColor: indicatorColor === 'primary' ? '#004aad' : theme.palette.secondary.main,
            height: { xs: 2, sm: 3 }
          },
          '& .MuiTabs-scrollButtons': {
            color: '#666',
            '&.Mui-disabled': {
              opacity: 0.3
            }
          },
          '& .MuiTab-root': {
            minHeight: { xs: 40, sm: 48 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 500,
            textTransform: 'none',
            px: { xs: 1, sm: 2 },
            minWidth: { xs: 'auto', sm: 90 },
            color: '#666',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              color: indicatorColor === 'primary' ? '#004aad' : theme.palette.secondary.main,
              fontWeight: 600
            },
            '&:hover': {
              color: indicatorColor === 'primary' ? '#004aad' : theme.palette.secondary.main,
              opacity: 0.8
            },
            '&.Mui-disabled': {
              opacity: 0.5
            }
          },
          ...tabsSx
        }}
      >
        {tabs.map((tab, index) => (
          <MuiTab
            key={index}
            label={responsive && isSmallMobile && tab.shortLabel ? tab.shortLabel : tab.label}
            disabled={tab.disabled}
            {...a11yProps(index)}
          />
        ))}
      </MuiTabs>

      {/* Tab Content */}
      <Box sx={{ 
        px: { xs: 1, sm: 2 },
        '& > div': {
          px: { xs: 0, sm: 1 }
        },
        ...contentSx
      }}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={currentValue} index={index}>
            {tab.content}
          </TabPanel>
        ))}
      </Box>
    </Paper>
  );
}

// Export TabPanel for custom usage
export { TabPanel };

// Export types
export type { TabPanelProps };

export default Tabs; 