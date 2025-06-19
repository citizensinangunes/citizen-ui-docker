import React from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  Button,
  Avatar
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import {
  Card,
  StatusBadge,
  DataCard,
  ProgressBar,
  BigButton,
  StatsCard,
  PrimaryButton
} from '@/components/ui';

interface DashboardProps {
  siteName: string;
}

// Site metrics
interface SiteMetrics {
  uptime: {
    percentage: number;
    status: string;
    lastIncident: string;
  };
  performance: {
    responseTime: string;
    status: string;
    trend: 'up' | 'down';
    changePercent: number;
  };
  deployment: {
    lastDeploy: string;
    status: string;
    branch: string;
    author: string;
  };
  resources: {
    cpu: {
      current: number;
      limit: number;
    };
    memory: {
      current: number;
      limit: number;
      unit: string;
    };
    storage: {
      current: number;
      limit: number;
      unit: string;
    };
  };
  analytics: {
    visitorsToday: number;
    visitorsChange: number;
    pageViews: number;
    pageViewsChange: number;
    averageSessionTime: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ siteName }) => {
  // Mock data
  const metrics: SiteMetrics = {
    uptime: {
      percentage: 99.98,
      status: 'Operational',
      lastIncident: '15 days ago'
    },
    performance: {
      responseTime: '187ms',
      status: 'Good',
      trend: 'down',
      changePercent: 12
    },
    deployment: {
      lastDeploy: '2 hours ago',
      status: 'Success',
      branch: 'main',
      author: 'Ahmet Sinan'
    },
    resources: {
      cpu: {
        current: 15,
        limit: 100
      },
      memory: {
        current: 128,
        limit: 512,
        unit: 'MB'
      },
      storage: {
        current: 1.2,
        limit: 5,
        unit: 'GB'
      }
    },
    analytics: {
      visitorsToday: 1248,
      visitorsChange: 5.7,
      pageViews: 3842,
      pageViewsChange: 12.3,
      averageSessionTime: '2m 15s'
    }
  };
  
  return (
    <Box sx={{ mb: 4, px: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Site Overview
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Monitor health, performance, and activity for {siteName}
        </Typography>
      </Box>
      
      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Status Overview */}
        <Grid item xs={12}>
          <Card 
            title="Status Overview"
            subtitle="Current site health and performance"
            padding="large"
          >
            <Grid container spacing={3}>
              {/* Uptime */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 1 
                }}>
                  <Typography variant="body2" fontWeight={500}>Uptime</Typography>
                  <StatusBadge status={metrics.uptime.status} />
                </Box>
                <DataCard
                  title="Uptime"
                  value={metrics.uptime.percentage}
                  type="circular-progress"
                  color="#2e7d32"
                  subtitle={`Last incident: ${metrics.uptime.lastIncident}`}
                />
              </Grid>
              
              {/* Performance */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 1 
                }}>
                  <Typography variant="body2" fontWeight={500}>Response Time</Typography>
                  <StatusBadge status={metrics.performance.status} />
                </Box>
                <DataCard
                  title="Response Time"
                  value={metrics.performance.responseTime}
                  icon={<SpeedIcon />}
                  color="#0288d1"
                  trend={{
                    direction: metrics.performance.trend,
                    value: metrics.performance.changePercent,
                    label: metrics.performance.trend === 'down' ? 'faster' : 'slower'
                  }}
                  subtitle="Average response time last 24 hours"
                />
              </Grid>
              
              {/* Recent Deployment */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 1 
                }}>
                  <Typography variant="body2" fontWeight={500}>Last Deployment</Typography>
                  <StatusBadge status={metrics.deployment.status} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: '3rem', color: '#004aad', mr: 2 }} />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {metrics.deployment.lastDeploy}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      Branch: {metrics.deployment.branch}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Avatar 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          bgcolor: '#004aad',
                          fontSize: '0.7rem',
                          mr: 1
                        }}
                      >
                        {metrics.deployment.author.substring(0, 2)}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {metrics.deployment.author}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      color: '#004aad',
                      '&:hover': { bgcolor: 'rgba(0, 74, 173, 0.05)' }
                    }}
                  >
                    View deployment details
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        
        {/* Resource Usage */}
        <Grid item xs={12} md={6}>
          <Card 
            title="Resource Usage"
            subtitle="CPU, memory and storage consumption"
            padding="large"
            sx={{ height: '100%' }}
          >
            <ProgressBar
              label="CPU Usage"
              current={metrics.resources.cpu.current}
              limit={metrics.resources.cpu.limit}
              showPercentage={true}
              color="#0288d1"
              icon={<MemoryIcon />}
            />
            
            <ProgressBar
              label="Memory Usage"
              current={metrics.resources.memory.current}
              limit={metrics.resources.memory.limit}
              unit={metrics.resources.memory.unit}
              color="#7b1fa2"
              icon={<StorageIcon />}
            />
            
            <ProgressBar
              label="Storage Usage"
              current={metrics.resources.storage.current}
              limit={metrics.resources.storage.limit}
              unit={metrics.resources.storage.unit}
              color="#ed6c02"
              icon={<StorageIcon />}
            />
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <PrimaryButton variant="contained">
                Upgrade Resources
              </PrimaryButton>
            </Box>
          </Card>
        </Grid>
        
        {/* Analytics Snapshot */}
        <Grid item xs={12} md={6}>
          <Card 
            title="Analytics Snapshot"
            subtitle="Today's site traffic and user engagement"
            padding="large"
            sx={{ height: '100%' }}
          >
            <Grid container spacing={3}>
              {/* Unique Visitors */}
              <Grid item xs={6}>
                <StatsCard
                  title="Unique Visitors"
                  value={metrics.analytics.visitorsToday}
                  icon={<PeopleIcon />}
                  trend={{
                    direction: 'up',
                    value: metrics.analytics.visitorsChange
                  }}
                />
              </Grid>
              
              {/* Page Views */}
              <Grid item xs={6}>
                <StatsCard
                  title="Page Views"
                  value={metrics.analytics.pageViews}
                  icon={<AnalyticsIcon />}
                  trend={{
                    direction: 'up',
                    value: metrics.analytics.pageViewsChange
                  }}
                />
              </Grid>
              
              {/* Avg Session Time */}
              <Grid item xs={12}>
                <StatsCard
                  title="Average Session Duration"
                  value={metrics.analytics.averageSessionTime}
                  icon={<AccessTimeIcon />}
                  variant="horizontal"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: '#004aad',
                  borderColor: '#004aad',
                  '&:hover': { bgcolor: 'rgba(0, 74, 173, 0.05)', borderColor: '#004aad' },
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                View detailed analytics
              </Button>
            </Box>
          </Card>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card 
            title="Quick Actions"
            subtitle="Common tasks for your site"
            padding="large"
          >
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <BigButton
                  icon={<CloudUploadIcon />}
                  label="Deploy Changes"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <BigButton
                  icon={<MemoryIcon />}
                  label="View Logs"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <BigButton
                  icon={<StorageIcon />}
                  label="Manage Docker"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <BigButton
                  icon={<PeopleIcon />}
                  label="Team Access"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 