import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Tabs,
  Tab,
  Chip,
  Divider,
  Avatar,
  Link,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  LockOutlined as LockIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  CloudDownload as DownloadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import DeployLogs, { LogEntry } from './DeployLogs';

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
  files?: number;
  assetsChanged?: number;
  redirectRules?: number;
  deploymentUrl?: string;
  framework: string;
  error?: string;
}

interface DeployDetailsProps {
  build: Build;
  onBack: () => void;
  canManage: boolean;
}

// Mock logs data
const mockLogs: LogEntry[] = [
  { type: 'info', message: 'Build started', timestamp: '14:25:11' },
  { type: 'info', message: 'Cloning repository...', timestamp: '14:25:12' },
  { type: 'info', message: 'Installing dependencies...', timestamp: '14:25:20' },
  { type: 'info', message: 'Running "npm install"', timestamp: '14:25:22' },
  { type: 'info', message: 'added 1506 packages, and audited 1507 packages in 30s', timestamp: '14:25:52' },
  { type: 'warning', message: '215 packages are looking for funding', timestamp: '14:25:53' },
  { type: 'info', message: 'Building project...', timestamp: '14:25:55' },
  { type: 'info', message: 'Running "npm run build"', timestamp: '14:25:56' },
  { type: 'info', message: '> build', timestamp: '14:25:57' },
  { type: 'info', message: '> next build', timestamp: '14:25:58' },
  { type: 'info', message: 'Attention: Next.js now collects completely anonymous telemetry regarding usage.', timestamp: '14:26:00' },
  { type: 'info', message: 'Learn more: https://nextjs.org/telemetry', timestamp: '14:26:01' },
  { type: 'info', message: 'info  - Linting and checking validity of types...', timestamp: '14:26:05' },
  { type: 'info', message: 'info  - Creating an optimized production build...', timestamp: '14:26:10' },
  { type: 'info', message: 'info  - Compiled successfully', timestamp: '14:26:15' },
  { type: 'info', message: 'info  - Collecting page data...', timestamp: '14:26:16' },
  { type: 'info', message: 'info  - Generating static pages (10/10)', timestamp: '14:26:18' },
  { type: 'info', message: 'info  - Finalizing page optimization...', timestamp: '14:26:20' },
  { type: 'info', message: 'Route (pages)', timestamp: '14:26:21' },
  { type: 'info', message: '┌ ○ / (ISR: 60 Seconds)', timestamp: '14:26:22' },
  { type: 'info', message: '└ ○ /404', timestamp: '14:26:22' },
  { type: 'info', message: 'Uploading build artifacts...', timestamp: '14:26:25' },
  { type: 'info', message: '12 new files uploaded', timestamp: '14:26:30' },
  { type: 'info', message: '12 assets changed', timestamp: '14:26:31' },
  { type: 'info', message: 'Processing 2 redirect rules', timestamp: '14:26:32' },
  { type: 'success', message: 'Deploy successful!', timestamp: '14:26:35' },
  { type: 'info', message: 'Deployment ready at https://dsfsdadas.citizen.company.com', timestamp: '14:26:36' }
];

const DeployDetails: React.FC<DeployDetailsProps> = ({ build, onBack, canManage }) => {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box>
      {/* Header / Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ color: 'text.secondary', mr: 2 }}
        >
          Back to builds
        </Button>
        
        <Typography variant="h5" fontWeight={600}>
          Published deploy for {build.siteName}
        </Typography>
      </Box>
      
      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left column - Deployment info */}
        <Box sx={{ flex: 2 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2
            }}
          >
            <Typography variant="body1" fontWeight={500} gutterBottom>
              {build.commitMessage}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                {build.deployTime},
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                by
              </Typography>
              <Avatar 
                sx={{ 
                  width: 20, 
                  height: 20, 
                  bgcolor: '#004aad',
                  fontSize: '0.7rem',
                  mx: 0.75
                }}
              >
                {build.authorAvatar}
              </Avatar>
              <Typography variant="body2" fontWeight={500} sx={{ mr: 1 }}>
                {build.author}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                on
              </Typography>
              <GitHubIcon fontSize="small" sx={{ color: '#333', mr: 0.5 }} />
              <Typography variant="body2" fontWeight={500}>
                GitHub
              </Typography>
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  ml: 1,
                  bgcolor: '#f0f0f0',
                  borderRadius: 1,
                  px: 1,
                  py: 0.25,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem'
                }}
              >
                {build.branch}: {build.id}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained"
                size="small"
                startIcon={<LanguageIcon />}
                sx={{ 
                  bgcolor: '#004aad',
                  color: 'white',
                  '&:hover': { bgcolor: '#003a87' }
                }}
              >
                Open production deploy
              </Button>
              <Button 
                variant="outlined"
                size="small"
                startIcon={<LockIcon />}
                sx={{ 
                  borderColor: '#e0e0e0',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: '#f5f5f5', borderColor: '#d0d0d0' }
                }}
              >
                Lock to stop auto publishing
              </Button>
              <Button 
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon fontSize="small" />}
                sx={{ 
                  borderColor: 'transparent',
                  color: '#004aad',
                  '&:hover': { bgcolor: 'rgba(0, 74, 173, 0.05)' }
                }}
              >
                Functions
              </Button>
              <Button 
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon fontSize="small" />}
                sx={{ 
                  borderColor: 'transparent',
                  color: '#004aad',
                  '&:hover': { bgcolor: 'rgba(0, 74, 173, 0.05)' }
                }}
              >
                Edge Functions
              </Button>
              <Button 
                variant="outlined"
                size="small"
                endIcon={<CopyIcon fontSize="small" />}
                sx={{ 
                  borderColor: 'transparent',
                  color: '#004aad',
                  '&:hover': { bgcolor: 'rgba(0, 74, 173, 0.05)' }
                }}
              >
                Permalink
              </Button>
              <Button 
                variant="outlined"
                size="small"
                endIcon={<DownloadIcon fontSize="small" />}
                sx={{ 
                  borderColor: 'transparent',
                  color: '#004aad',
                  '&:hover': { bgcolor: 'rgba(0, 74, 173, 0.05)' }
                }}
              >
                Download
              </Button>
            </Box>
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 0, 
              mb: 3, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              px: 3, 
              py: 2, 
              borderBottom: '1px solid #f0f0f0',
              bgcolor: '#fafafa'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 30, 
                    height: 30, 
                    bgcolor: '#f5f5f5',
                    fontSize: '1rem',
                    mr: 1
                  }}
                >
                  N
                </Avatar>
                <Typography variant="subtitle1" fontWeight={500}>
                  {build.siteName} is a {build.framework} site.
                </Typography>
              </Box>
              <IconButton size="small" sx={{ ml: 'auto' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Auto-detected {build.framework} and will use the {build.framework} Runtime to build and deploy your site.
              </Typography>
              
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  color: '#004aad',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Read more about deploying with {build.framework} on Citizen
                <OpenInNewIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
              </Link>
            </Box>
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 3, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ p: 3, pb: 2 }}>
              Deploy summary
            </Typography>
            
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center' }}>
              <InfoIcon fontSize="small" sx={{ color: '#666', mr: 1.5 }} />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {build.files} new files uploaded
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {build.assetsChanged} assets changed.
                </Typography>
              </Box>
            </Box>
            
            <Divider />
            
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center' }}>
              <InfoIcon fontSize="small" sx={{ color: '#666', mr: 1.5 }} />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {build.redirectRules} redirect rules processed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All redirect rules deployed without errors.
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          {/* Deployment logs */}
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: '1px solid #f0f0f0',
                '& .MuiTabs-indicator': {
                  backgroundColor: '#004aad',
                }
              }}
            >
              <Tab 
                label="Logs" 
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 3
                }} 
              />
              <Tab 
                label="Functions" 
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 3
                }} 
              />
              <Tab 
                label="Headers" 
                sx={{ 
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 3
                }} 
              />
            </Tabs>
            
            {tabValue === 0 && (
              <DeployLogs logs={mockLogs} />
            )}
            
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                  No functions found in this deployment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This site doesn't use any serverless functions.
                </Typography>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                  Default headers
                </Typography>
                <Typography variant="body2" color="text.secondary" component="pre" sx={{ 
                  fontFamily: 'monospace',
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  overflowX: 'auto'
                }}>
                  {`X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: same-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Right column - Performance test */}
        <Box sx={{ flex: 1 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: '1px solid #e0e0e0', 
              borderRadius: 2,
              bgcolor: '#f8fbff'
            }}
          >
            <Typography variant="h6" fontWeight={600} color="#004aad" gutterBottom>
              Test your site's Lighthouse performance
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              Want to see how your site will perform before you deploy? Install the Lighthouse plugin for build-time Lighthouse scores and reports.
            </Typography>
            
            <Link 
              href="#" 
              underline="none" 
              sx={{ 
                color: '#004aad',
                display: 'inline-flex',
                alignItems: 'center',
                '&:hover': { textDecoration: 'underline' },
                fontWeight: 500,
                mb: 2
              }}
            >
              Learn more
              <OpenInNewIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
            </Link>
            
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#3f51b5',
                color: 'white',
                '&:hover': { bgcolor: '#303f9f' },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Install Lighthouse plugin
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DeployDetails;