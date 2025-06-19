"use client";

import React, { useState } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Box, 
  Typography, 
  Paper,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { 
  People as PeopleIcon,
  PersonAdd as InviteIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import MemberManagement from './components/MemberManagement';
import InviteManagement from './components/InviteManagement';
import SecuritySettings from './components/SecuritySettings';
import GeneralSettings from './components/GeneralSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const TeamSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} color="#004aad" gutterBottom>
          Team Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your team members, invitations, and security settings
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="team settings tabs"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            px: 2,
            '& .MuiTabs-indicator': {
              backgroundColor: '#004aad'
            }
          }}
        >
          <Tab 
            icon={<PeopleIcon />} 
            label="Members" 
            iconPosition="start"
            {...a11yProps(0)} 
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              '&.Mui-selected': { color: '#004aad' }
            }}
          />
          <Tab 
            icon={<InviteIcon />} 
            label="Invitations" 
            iconPosition="start"
            {...a11yProps(1)} 
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              '&.Mui-selected': { color: '#004aad' }
            }}
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Security" 
            iconPosition="start"
            {...a11yProps(2)} 
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              '&.Mui-selected': { color: '#004aad' }
            }}
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="General" 
            iconPosition="start"
            {...a11yProps(3)} 
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              '&.Mui-selected': { color: '#004aad' }
            }}
          />
        </Tabs>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <MemberManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <InviteManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SecuritySettings />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <GeneralSettings />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TeamSettings; 