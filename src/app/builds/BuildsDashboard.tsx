"use client";

import React, { useState, useEffect } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Tabs,
  Tab,
  Chip,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/context/AuthContext';
import BuildCard from './BuildCard';
import DeployDetails from './DeployDetails';

// Build type definition
interface Build {
  id: string;
  siteName: string;
  branch: string;
  commitMessage: string;
  author: string;
  authorAvatar: string;
  status: string;
  deployTime: string;
  deployDuration: string;
  files: number;
  assetsChanged: number;
  redirectRules: number;
  deploymentUrl: string;
  framework: string;
  error?: string;
}

export default function BuildsDashboard() {
  const { currentRole } = useRole();
  const { token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [selectedBuild, setSelectedBuild] = useState<string | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch builds from API
  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, you would fetch from an API
        // For now, we'll just simulate a delay and return empty data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Demo data - in a real app this would come from an API
        const demoBuilds: Build[] = [
          {
            id: 'main@5ff9fea',
            siteName: 'citizen-ui',
            branch: 'Production',
            commitMessage: 'Authentication implementation',
            author: 'Current User',
            authorAvatar: 'CU',
            status: 'Completed',
            deployTime: 'Today at 5:25 PM',
            deployDuration: '1m 11s',
            files: 12,
            assetsChanged: 12,
            redirectRules: 2,
            deploymentUrl: 'https://citizen-ui.citizen.dev',
            framework: 'Next.js'
          },
          {
            id: 'feature@a89d2e1',
            siteName: 'marketing-site',
            branch: 'Feature branch',
            commitMessage: 'Update landing page design',
            author: 'Team Member',
            authorAvatar: 'TM',
            status: 'Completed',
            deployTime: 'Yesterday at 4:12 PM',
            deployDuration: '1m 28s',
            files: 15,
            assetsChanged: 10,
            redirectRules: 0,
            deploymentUrl: 'https://feature--marketing-site.citizen.dev',
            framework: 'React'
          }
        ];
        
        setBuilds(demoBuilds);
      } catch (err) {
        setError('Failed to load builds. Please try again later.');
        console.error('Error fetching builds:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuilds();
  }, [token]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleViewDeployDetails = (buildId: string) => {
    setSelectedBuild(buildId);
  };
  
  const handleCloseDeployDetails = () => {
    setSelectedBuild(null);
  };
  
  // Find the selected build
  const selectedBuildData = selectedBuild ? builds.find(build => build.id === selectedBuild) : null;

  const refreshBuilds = () => {
    setLoading(true);
    setError(null);
    
    // In a real app, this would refresh the data from the API
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  return (
    <Box sx={{ p: 3 }}>
      {selectedBuildData ? (
        // If a build is selected, show its details
        <DeployDetails 
          build={selectedBuildData} 
          onBack={handleCloseDeployDetails} 
          canManage={currentRole !== 'viewer'} 
        />
      ) : (
        // Otherwise show the builds dashboard
        <>
          {/* Build status section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Team builds status <Chip label="Free" size="small" sx={{ ml: 1, bgcolor: '#f0f7ff', color: '#0066cc', height: 24 }} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total data from this usage period, updated hourly.
                </Typography>
              </Box>
              
              {currentRole !== 'viewer' && (
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  size="small"
                  sx={{
                    borderColor: '#e0e0e0',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: '#f5f5f5', borderColor: '#d0d0d0' }
                  }}
                >
                  Manage build capacity
                </Button>
              )}
            </Box>
            
            <Grid container spacing={4} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Concurrent builds
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h4" fontWeight={600} sx={{ mr: 1 }}>
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    /1
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total build minutes used
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h4" fontWeight={600} sx={{ mr: 1 }}>
                    5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    /300
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Build concurrency
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h4" fontWeight={600} sx={{ mr: 1 }}>
                    Standard
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Recent builds section */}
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 0 }}>
              <Typography variant="h5" fontWeight={600}>Recent builds</Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  size="small"
                  onClick={refreshBuilds}
                  disabled={loading}
                  sx={{
                    borderColor: '#e0e0e0',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: '#f5f5f5', borderColor: '#d0d0d0' }
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  size="small"
                  sx={{
                    borderColor: '#e0e0e0',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: '#f5f5f5', borderColor: '#d0d0d0' }
                  }}
                >
                  All builds
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ px: 3, pt: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    fontSize: '0.9rem',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#004aad',
                  },
                }}
              >
                <Tab 
                  label="All builds" 
                  sx={{ 
                    '&.Mui-selected': { color: '#004aad', fontWeight: 600 }
                  }} 
                />
                <Tab 
                  label="Production" 
                  sx={{ 
                    '&.Mui-selected': { color: '#004aad', fontWeight: 600 }
                  }} 
                />
                <Tab 
                  label="Deploy previews" 
                  sx={{ 
                    '&.Mui-selected': { color: '#004aad', fontWeight: 600 }
                  }}
                />
              </Tabs>
            </Box>
            
            <Divider sx={{ mt: 1 }} />
            
            {loading && <LinearProgress sx={{ height: 2 }} />}
            
            <Box sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {loading && builds.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : builds.length > 0 ? (
                builds.map((build, index) => (
                  <BuildCard
                    key={build.id}
                    build={build}
                    canManage={currentRole !== 'viewer'}
                    isLast={index === builds.length - 1}
                    onViewDetails={() => handleViewDeployDetails(build.id)}
                  />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No builds found. When you deploy your site, builds will appear here.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}